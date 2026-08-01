import { AtividadeMei } from '@prisma/client';

export interface GerarGuiaDasParams {
  cnpj: string;
  atividade: AtividadeMei;
  competencia: string; // "YYYY-MM"
}

export interface GuiaDasGerada {
  valor: number;
  vencimento: Date;
  pixCopiaECola: string;
  qrCodeUrl: string;
  codigoBarras: string;
}

/**
 * Contrato de integração com o Gov.br / API do Simples Nacional (SIMEI)
 * para geração e consulta do DAS.
 *
 * Integração real: requer credenciamento junto ao Gov.br (certificado
 * digital ou client credentials OAuth2), endpoint documentado em
 * GOVBR_BASE_URL, e client id/secret em GOVBR_CLIENT_ID/GOVBR_CLIENT_SECRET.
 */
export interface GovBrGateway {
  gerarGuiaDas(params: GerarGuiaDasParams): Promise<GuiaDasGerada>;
  consultarSituacao(cnpj: string): Promise<{ situacaoRegular: boolean }>;
}

export const GOV_BR_GATEWAY = Symbol('GOV_BR_GATEWAY');
