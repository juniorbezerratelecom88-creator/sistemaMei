import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CaixaStatus, TipoMovimentoCaixa } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AbrirCaixaDto,
  FecharCaixaDto,
  MovimentoCaixaDto,
} from './dto/caixa.dto';

@Injectable()
export class CaixaService {
  constructor(private readonly prisma: PrismaService) {}

  async abrir(empresaId: string, userId: string, dto: AbrirCaixaDto) {
    const caixaAberto = await this.prisma.caixa.findFirst({
      where: { empresaId, status: CaixaStatus.ABERTO },
    });
    if (caixaAberto) {
      throw new BadRequestException(
        'Já existe um caixa aberto para esta empresa.',
      );
    }

    return this.prisma.caixa.create({
      data: {
        empresaId,
        abertoPorId: userId,
        valorAbertura: dto.valorAbertura,
      },
    });
  }

  async fechar(empresaId: string, caixaId: string, dto: FecharCaixaDto) {
    const caixa = await this.getAberto(empresaId, caixaId);

    return this.prisma.caixa.update({
      where: { id: caixa.id },
      data: {
        status: CaixaStatus.FECHADO,
        valorFechamento: dto.valorFechamento,
        fechadoEm: new Date(),
      },
    });
  }

  async registrarMovimento(
    empresaId: string,
    caixaId: string,
    dto: MovimentoCaixaDto,
  ) {
    await this.getAberto(empresaId, caixaId);

    if (dto.tipo === TipoMovimentoCaixa.VENDA) {
      throw new BadRequestException(
        'Movimentos de venda são criados automaticamente ao registrar uma venda.',
      );
    }

    return this.prisma.movimentoCaixa.create({
      data: {
        caixaId,
        tipo: dto.tipo,
        valor: dto.valor,
        descricao: dto.descricao,
        formaPagamento: dto.formaPagamento,
      },
    });
  }

  async atual(empresaId: string) {
    return this.prisma.caixa.findFirst({
      where: { empresaId, status: CaixaStatus.ABERTO },
      include: { movimentos: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async getAberto(empresaId: string, caixaId: string) {
    const caixa = await this.prisma.caixa.findFirst({
      where: { id: caixaId, empresaId },
    });
    if (!caixa) throw new NotFoundException('Caixa não encontrado.');
    if (caixa.status !== CaixaStatus.ABERTO) {
      throw new BadRequestException('Caixa já está fechado.');
    }
    return caixa;
  }
}
