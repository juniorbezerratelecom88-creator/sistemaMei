import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DasStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GOV_BR_GATEWAY, GovBrGateway } from './gov-br-gateway.interface';
import { FISCAL_REMINDERS_QUEUE } from './fiscal.constants';

function competenciaAtual(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

@Injectable()
export class FiscalService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(GOV_BR_GATEWAY) private readonly govBrGateway: GovBrGateway,
    @InjectQueue(FISCAL_REMINDERS_QUEUE) private readonly remindersQueue: Queue,
  ) {}

  async gerarGuiaMensal(empresaId: string, competencia = competenciaAtual()) {
    const empresa = await this.prisma.empresa.findUniqueOrThrow({
      where: { id: empresaId },
    });

    const existente = await this.prisma.dasGuia.findUnique({
      where: { empresaId_competencia: { empresaId, competencia } },
    });
    if (existente) return existente;

    const guiaGerada = await this.govBrGateway.gerarGuiaDas({
      cnpj: empresa.cnpj,
      atividade: empresa.atividade,
      competencia,
    });

    const guia = await this.prisma.dasGuia.create({
      data: {
        empresaId,
        competencia,
        valor: guiaGerada.valor,
        vencimento: guiaGerada.vencimento,
        pixCopiaECola: guiaGerada.pixCopiaECola,
        qrCodeUrl: guiaGerada.qrCodeUrl,
        codigoBarras: guiaGerada.codigoBarras,
        status: DasStatus.PENDENTE,
      },
    });

    await this.agendarLembretes(guia.id, guia.vencimento);

    return guia;
  }

  async listar(empresaId: string) {
    return this.prisma.dasGuia.findMany({
      where: { empresaId },
      orderBy: { competencia: 'desc' },
    });
  }

  async registrarPagamento(empresaId: string, guiaId: string) {
    const guia = await this.prisma.dasGuia.findFirst({
      where: { id: guiaId, empresaId },
    });
    if (!guia) throw new NotFoundException('Guia DAS não encontrada.');

    // Simula a conciliação automática que, em produção, seria disparada
    // por um webhook do PSP/gateway de pagamento assim que o Pix é compensado.
    return this.prisma.dasGuia.update({
      where: { id: guiaId },
      data: { status: DasStatus.PAGO, pagoEm: new Date() },
    });
  }

  private async agendarLembretes(dasGuiaId: string, vencimento: Date) {
    const tresDiasAntes = new Date(vencimento);
    tresDiasAntes.setDate(tresDiasAntes.getDate() - 3);

    const primeiroDiaUtilDoMes = new Date(
      vencimento.getFullYear(),
      vencimento.getMonth(),
      1,
    );

    const jobs = [tresDiasAntes, primeiroDiaUtilDoMes]
      .filter((data) => data.getTime() > Date.now())
      .map((data) =>
        this.remindersQueue.add(
          'lembrete-das',
          { dasGuiaId },
          { delay: data.getTime() - Date.now() },
        ),
      );

    await Promise.all(jobs);
  }
}
