import { Injectable } from '@nestjs/common';
import { DasStatus, VendaStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async resumo(empresaId: string) {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(
      agora.getFullYear(),
      agora.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const [vendasDoMes, contasPagasDoMes, dasDoMes, produtosMaisVendidos] =
      await Promise.all([
        this.prisma.venda.findMany({
          where: {
            empresaId,
            status: VendaStatus.CONCLUIDA,
            createdAt: { gte: inicioMes, lte: fimMes },
          },
          include: { itens: { include: { produto: true } } },
        }),
        this.prisma.contaPagar.aggregate({
          where: {
            empresaId,
            status: 'PAGO',
            pagoEm: { gte: inicioMes, lte: fimMes },
          },
          _sum: { valor: true },
        }),
        this.prisma.dasGuia.findFirst({
          where: { empresaId },
          orderBy: { competencia: 'desc' },
        }),
        this.prisma.vendaItem.groupBy({
          by: ['produtoId'],
          where: {
            venda: {
              empresaId,
              status: VendaStatus.CONCLUIDA,
              createdAt: { gte: inicioMes, lte: fimMes },
            },
          },
          _sum: { quantidade: true, subtotal: true },
          orderBy: { _sum: { quantidade: 'desc' } },
          take: 5,
        }),
      ]);

    const faturamentoBrutoMes = vendasDoMes.reduce(
      (acc, v) => acc + Number(v.valorTotal),
      0,
    );
    const custoTotalMes = vendasDoMes.reduce(
      (acc, v) =>
        acc +
        v.itens.reduce(
          (s, item) => s + Number(item.produto.custoUnitario) * item.quantidade,
          0,
        ),
      0,
    );
    const dasPagoNoMes =
      dasDoMes?.status === DasStatus.PAGO ? Number(dasDoMes.valor) : 0;
    const despesasPagasMes = Number(contasPagasDoMes._sum.valor ?? 0);

    const lucroLiquidoMes =
      faturamentoBrutoMes - custoTotalMes - despesasPagasMes - dasPagoNoMes;
    const ticketMedio =
      vendasDoMes.length > 0 ? faturamentoBrutoMes / vendasDoMes.length : 0;

    const produtoIds = produtosMaisVendidos.map((p) => p.produtoId);
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: produtoIds } },
    });
    const produtoPorId = new Map(produtos.map((p) => [p.id, p]));

    return {
      faturamentoBrutoMes,
      lucroLiquidoMes,
      ticketMedio: Number(ticketMedio.toFixed(2)),
      quantidadeVendasMes: vendasDoMes.length,
      produtosMaisVendidos: produtosMaisVendidos.map((item) => ({
        produtoId: item.produtoId,
        nome: produtoPorId.get(item.produtoId)?.nome ?? 'Produto removido',
        quantidadeVendida: item._sum.quantidade ?? 0,
        totalVendido: Number(item._sum.subtotal ?? 0),
      })),
      statusDas: dasDoMes
        ? {
            competencia: dasDoMes.competencia,
            status: dasDoMes.status,
            vencimento: dasDoMes.vencimento,
          }
        : null,
    };
  }
}
