import { TipoNota } from '@prisma/client';

export interface EmitirNotaParams {
  tipo: TipoNota;
  empresaCnpj: string;
  valorTotal: number;
  clienteNome?: string;
  clienteDocumento?: string;
  itens: { descricao: string; quantidade: number; valorUnitario: number }[];
}

export interface NotaEmitida {
  numero: string;
  serie: string;
  xmlUrl: string;
  pdfUrl: string;
}

/**
 * Contrato de integração com o gateway de emissão fiscal (ex: Focus NFe,
 * PlugNFe/TecnoSpeed, e-Notas, ou diretamente o Portal Nacional da NF-e).
 *
 * Integração real: requer NFE_GATEWAY_API_KEY/NFE_GATEWAY_BASE_URL e o
 * certificado digital A1 da empresa (ver módulo Certificado) configurado
 * junto ao provedor.
 */
export interface NfeGateway {
  emitirNota(params: EmitirNotaParams): Promise<NotaEmitida>;
  cancelarNota(numero: string, serie: string): Promise<{ cancelada: boolean }>;
}

export const NFE_GATEWAY = Symbol('NFE_GATEWAY');
