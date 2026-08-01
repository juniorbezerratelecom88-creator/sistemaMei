import { Injectable } from '@nestjs/common';
import {
  ContaPagarStatus,
  ContaReceberStatus,
  VendaStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

function chaveData(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class FluxoCaixaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Fluxo de caixa realizado (entradas/saídas já efetivadas) num intervalo. */
  async realizado(empresaId: string, dataInicio: Date, dataFim: Date) {
    const [vendas, contasPagas] = await Promise.all([
      this.prisma.venda.findMany({
        where: {
          empresaId,
          status: VendaStatus.CONCLUIDA,
          createdAt: { gte: dataInicio, lte: dataFim },
        },
        select: { valorTotal: true, createdAt: true },
      }),
      this.prisma.contaPagar.findMany({
        where: {
          empresaId,
          status: ContaPagarStatus.PAGO,
          pagoEm: { gte: dataInicio, lte: dataFim },
        },
        select: { valor: true, pagoEm: true },
      }),
    ]);

    const porDia = new Map<string, { entradas: number; saidas: number }>();

    for (const venda of vendas) {
      const chave = chaveData(venda.createdAt);
      const bucket = porDia.get(chave) ?? { entradas: 0, saidas: 0 };
      bucket.entradas += Number(venda.valorTotal);
      porDia.set(chave, bucket);
    }

    for (const conta of contasPagas) {
      const chave = chaveData(conta.pagoEm as Date);
      const bucket = porDia.get(chave) ?? { entradas: 0, saidas: 0 };
      bucket.saidas += Number(conta.valor);
      porDia.set(chave, bucket);
    }

    const dias = [...porDia.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, valores]) => ({
        data,
        entradas: valores.entradas,
        saidas: valores.saidas,
        saldo: valores.entradas - valores.saidas,
      }));

    return {
      dias,
      totalEntradas: dias.reduce((acc, dia) => acc + dia.entradas, 0),
      totalSaidas: dias.reduce((acc, dia) => acc + dia.saidas, 0),
    };
  }

  /** Fluxo de caixa projetado a partir de contas a pagar/receber pendentes. */
  async projetado(empresaId: string, dias = 30) {
    const hoje = new Date();
    const limite = new Date(hoje);
    limite.setDate(limite.getDate() + dias);

    const [contasReceber, contasPagar] = await Promise.all([
      this.prisma.contaReceber.findMany({
        where: {
          empresaId,
          status: ContaReceberStatus.PENDENTE,
          vencimento: { gte: hoje, lte: limite },
        },
        select: { valor: true, vencimento: true, descricao: true },
      }),
      this.prisma.contaPagar.findMany({
        where: {
          empresaId,
          status: ContaPagarStatus.PENDENTE,
          vencimento: { gte: hoje, lte: limite },
        },
        select: { valor: true, vencimento: true, descricao: true },
      }),
    ]);

    const entradasPrevistas = contasReceber.reduce(
      (acc, c) => acc + Number(c.valor),
      0,
    );
    const saidasPrevistas = contasPagar.reduce(
      (acc, c) => acc + Number(c.valor),
      0,
    );

    return {
      periodoDias: dias,
      entradasPrevistas,
      saidasPrevistas,
      saldoProjetado: entradasPrevistas - saidasPrevistas,
      contasReceber,
      contasPagar,
    };
  }
}
