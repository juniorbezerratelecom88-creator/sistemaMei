import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';
import {
  EmitirNotaParams,
  NfeGateway,
  NotaEmitida,
} from '../nfe-gateway.interface';

@Injectable()
export class NfeGatewayMockAdapter implements NfeGateway {
  private readonly logger = new Logger(NfeGatewayMockAdapter.name);

  async emitirNota(params: EmitirNotaParams): Promise<NotaEmitida> {
    this.logger.log(
      `[MOCK] Emitindo ${params.tipo} para CNPJ ${params.empresaCnpj}, valor R$ ${params.valorTotal.toFixed(2)}. ` +
        'Trocar por chamada real ao gateway de NF-e (Focus NFe/PlugNFe/e-Notas) quando houver contrato ativo.',
    );

    const numero = String(randomInt(1, 999_999)).padStart(9, '0');
    const serie = '1';
    const identificador = randomBytes(8).toString('hex');

    return {
      numero,
      serie,
      xmlUrl: `https://mock.gateway-nfe.com.br/notas/${identificador}.xml`,
      pdfUrl: `https://mock.gateway-nfe.com.br/notas/${identificador}.pdf`,
    };
  }

  async cancelarNota(
    _numero: string,
    _serie: string,
  ): Promise<{ cancelada: boolean }> {
    return { cancelada: true };
  }
}
