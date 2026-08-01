import { Injectable, Logger } from '@nestjs/common';
import { BankGateway, TransacaoImportada } from '../bank-gateway.interface';

@Injectable()
export class OpenFinanceMockAdapter implements BankGateway {
  private readonly logger = new Logger(OpenFinanceMockAdapter.name);

  async sincronizarTransacoes(
    _accessToken: string,
  ): Promise<TransacaoImportada[]> {
    this.logger.log(
      '[MOCK] Sincronizando transações via Open Finance. ' +
        'Trocar por chamada real (Pluggy/Belvo/API do banco) quando houver consentimento ativo.',
    );

    const hoje = new Date();
    return [
      {
        dataTransacao: hoje,
        descricao: 'PIX RECEBIDO - MOCK',
        valor: 150.0,
        tipo: 'CREDITO',
      },
      {
        dataTransacao: hoje,
        descricao: 'TARIFA BANCARIA - MOCK',
        valor: 12.9,
        tipo: 'DEBITO',
      },
    ];
  }
}
