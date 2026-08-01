import { Injectable, Logger } from '@nestjs/common';
import { AtividadeMei } from '@prisma/client';
import { randomBytes } from 'crypto';
import {
  GerarGuiaDasParams,
  GovBrGateway,
  GuiaDasGerada,
} from '../gov-br-gateway.interface';

// Valores ilustrativos (mock). Os valores reais do DAS-MEI variam por ano-calendário
// e são publicados pelo Comitê Gestor do Simples Nacional.
const VALOR_BASE_POR_ATIVIDADE: Record<AtividadeMei, number> = {
  [AtividadeMei.COMERCIO]: 76.9,
  [AtividadeMei.INDUSTRIA]: 76.9,
  [AtividadeMei.SERVICOS]: 80.9,
};

function proximoDiaUtil(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  if (day === 6) result.setDate(result.getDate() + 2);
  if (day === 0) result.setDate(result.getDate() + 1);
  return result;
}

@Injectable()
export class SimeiGatewayMockAdapter implements GovBrGateway {
  private readonly logger = new Logger(SimeiGatewayMockAdapter.name);

  async gerarGuiaDas(params: GerarGuiaDasParams): Promise<GuiaDasGerada> {
    this.logger.log(
      `[MOCK] Gerando DAS para CNPJ ${params.cnpj}, competência ${params.competencia}. ` +
        'Trocar por chamada real à API SIMEI/Sefaz quando as credenciais Gov.br estiverem disponíveis.',
    );

    const [ano, mes] = params.competencia.split('-').map(Number);
    const vencimentoBase = new Date(ano, mes, 20); // dia 20 do mês seguinte à competência
    const vencimento = proximoDiaUtil(vencimentoBase);

    const valor = VALOR_BASE_POR_ATIVIDADE[params.atividade];
    const identificador = randomBytes(6).toString('hex');

    return {
      valor,
      vencimento,
      pixCopiaECola: `00020126580014BR.GOV.BCB.PIX0136MOCK-DAS-${identificador}5204000053039865406${valor.toFixed(2)}5802BR5913SISTEMA MEI6009SAO PAULO62070503***6304MOCK`,
      qrCodeUrl: `https://mock.receita.fazenda.gov.br/das/qrcode/${identificador}.png`,
      codigoBarras: `85800000${identificador}`,
    };
  }

  async consultarSituacao(
    _cnpj: string,
  ): Promise<{ situacaoRegular: boolean }> {
    return { situacaoRegular: true };
  }
}
