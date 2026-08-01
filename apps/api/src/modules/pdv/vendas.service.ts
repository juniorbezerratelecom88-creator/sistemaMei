import { BadRequestException, Injectable } from '@nestjs/common';
import { TipoMovimentoCaixa } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CaixaService } from './caixa.service';
import { CreateVendaDto } from './dto/create-venda.dto';

@Injectable()
export class VendasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caixaService: CaixaService,
  ) {}

  async create(empresaId: string, dto: CreateVendaDto) {
    const caixa = await this.caixaService.atual(empresaId);
    if (!caixa) {
      throw new BadRequestException(
        'Nenhum caixa aberto. Abra o caixa antes de registrar vendas.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const produtos = await tx.produto.findMany({
        where: {
          empresaId,
          id: { in: dto.itens.map((item) => item.produtoId) },
        },
      });

      const produtoPorId = new Map(
        produtos.map((produto) => [produto.id, produto]),
      );

      let valorTotal = 0;
      const itensData = dto.itens.map((item) => {
        const produto = produtoPorId.get(item.produtoId);
        if (!produto) {
          throw new BadRequestException(
            `Produto ${item.produtoId} não encontrado.`,
          );
        }
        if (produto.estoqueAtual < item.quantidade) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto "${produto.nome}".`,
          );
        }

        const precoUnitario = Number(produto.precoVenda);
        const subtotal = precoUnitario * item.quantidade;
        valorTotal += subtotal;

        return {
          produtoId: produto.id,
          quantidade: item.quantidade,
          precoUnitario,
          subtotal,
        };
      });

      const venda = await tx.venda.create({
        data: {
          empresaId,
          caixaId: caixa.id,
          clienteNome: dto.clienteNome,
          clienteDocumento: dto.clienteDocumento,
          formaPagamento: dto.formaPagamento,
          valorTotal,
          itens: { create: itensData },
        },
        include: { itens: { include: { produto: true } } },
      });

      for (const item of itensData) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { decrement: item.quantidade } },
        });
      }

      await tx.movimentoCaixa.create({
        data: {
          caixaId: caixa.id,
          tipo: TipoMovimentoCaixa.VENDA,
          valor: valorTotal,
          formaPagamento: dto.formaPagamento,
          descricao: `Venda ${venda.id}`,
        },
      });

      return venda;
    });
  }

  findAll(empresaId: string) {
    return this.prisma.venda.findMany({
      where: { empresaId },
      include: { itens: true, notaFiscal: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
