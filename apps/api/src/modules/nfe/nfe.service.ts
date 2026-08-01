import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { StatusNota } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NFE_GATEWAY, NfeGateway } from './nfe-gateway.interface';
import { NFE_NOTIFICATIONS_QUEUE } from './nfe.constants';
import { EmitirNotaDto } from './dto/emitir-nota.dto';

@Injectable()
export class NfeService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NFE_GATEWAY) private readonly nfeGateway: NfeGateway,
    @InjectQueue(NFE_NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue: Queue,
  ) {}

  async emitirParaVenda(
    empresaId: string,
    vendaId: string,
    dto: EmitirNotaDto,
  ) {
    const venda = await this.prisma.venda.findFirst({
      where: { id: vendaId, empresaId },
      include: {
        itens: { include: { produto: true } },
        notaFiscal: true,
        empresa: true,
      },
    });
    if (!venda) throw new NotFoundException('Venda não encontrada.');
    if (venda.notaFiscal) return venda.notaFiscal;

    const emitida = await this.nfeGateway.emitirNota({
      tipo: dto.tipo,
      empresaCnpj: venda.empresa.cnpj,
      valorTotal: Number(venda.valorTotal),
      clienteNome: dto.clienteNome ?? venda.clienteNome ?? undefined,
      clienteDocumento:
        dto.clienteDocumento ?? venda.clienteDocumento ?? undefined,
      itens: venda.itens.map((item) => ({
        descricao: item.produto.nome,
        quantidade: item.quantidade,
        valorUnitario: Number(item.precoUnitario),
      })),
    });

    const nota = await this.prisma.notaFiscal.create({
      data: {
        empresaId,
        vendaId,
        tipo: dto.tipo,
        numero: emitida.numero,
        serie: emitida.serie,
        status: StatusNota.AUTORIZADA,
        xmlUrl: emitida.xmlUrl,
        pdfUrl: emitida.pdfUrl,
        valorTotal: venda.valorTotal,
        clienteNome: dto.clienteNome ?? venda.clienteNome,
        clienteDocumento: dto.clienteDocumento ?? venda.clienteDocumento,
        clienteEmail: dto.clienteEmail,
      },
    });

    if (dto.clienteEmail) {
      await this.notificationsQueue.add('envio-nota', {
        notaFiscalId: nota.id,
      });
    }

    return nota;
  }

  async listar(empresaId: string) {
    return this.prisma.notaFiscal.findMany({
      where: { empresaId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
