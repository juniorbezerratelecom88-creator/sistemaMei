import { Injectable } from '@nestjs/common';
import { VendaStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FAIXAS_ALERTA, TETO_ANUAL_MEI } from './faturamento.constants';

@Injectable()
export class FaturamentoService {
  constructor(private readonly prisma: PrismaService) {}

  async termometro(empresaId: string, ano = new Date().getFullYear()) {
    const empresa = await this.prisma.empresa.findUniqueOrThrow({
      where: { id: empresaId },
    });

    const inicioAno = new Date(ano, 0, 1);
    const fimAno = new Date(ano, 11, 31, 23, 59, 59, 999);
    const dataInicioCalculo =
      empresa.dataAbertura.getFullYear() === ano
        ? empresa.dataAbertura
        : inicioAno;

    const mesesAtivos = 12 - dataInicioCalculo.getMonth();
    const tetoProporcional = (TETO_ANUAL_MEI / 12) * mesesAtivos;

    const agregado = await this.prisma.venda.aggregate({
      where: {
        empresaId,
        status: VendaStatus.CONCLUIDA,
        createdAt: { gte: inicioAno, lte: fimAno },
      },
      _sum: { valorTotal: true },
    });

    const faturamentoAcumulado = Number(agregado._sum.valorTotal ?? 0);
    const percentual =
      tetoProporcional > 0
        ? (faturamentoAcumulado / tetoProporcional) * 100
        : 0;

    const faixaAtingida = FAIXAS_ALERTA.find(
      (faixa) => percentual / 100 >= faixa,
    );

    return {
      ano,
      tetoAnualMei: TETO_ANUAL_MEI,
      tetoProporcional: Number(tetoProporcional.toFixed(2)),
      faturamentoAcumulado,
      percentual: Number(percentual.toFixed(2)),
      alerta: faixaAtingida ? `${faixaAtingida * 100}%` : null,
      desenquadramentoIminente: percentual >= 100,
    };
  }

  async relatorioDasn(empresaId: string, ano = new Date().getFullYear()) {
    const empresa = await this.prisma.empresa.findUniqueOrThrow({
      where: { id: empresaId },
    });

    const inicioAno = new Date(ano, 0, 1);
    const fimAno = new Date(ano, 11, 31, 23, 59, 59, 999);

    const vendas = await this.prisma.venda.findMany({
      where: {
        empresaId,
        status: VendaStatus.CONCLUIDA,
        createdAt: { gte: inicioAno, lte: fimAno },
      },
      include: { notaFiscal: true },
    });

    const comNota = vendas.filter((venda) => venda.notaFiscal);
    const semNota = vendas.filter((venda) => !venda.notaFiscal);

    const somar = (lista: typeof vendas) =>
      lista.reduce((total, venda) => total + Number(venda.valorTotal), 0);

    return {
      ano,
      atividade: empresa.atividade,
      receitaComNota: somar(comNota),
      receitaSemNota: somar(semNota),
      receitaTotal: somar(vendas),
      quantidadeVendas: vendas.length,
    };
  }
}
