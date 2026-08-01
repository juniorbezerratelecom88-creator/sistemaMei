export interface TransacaoImportada {
  dataTransacao: Date;
  descricao: string;
  valor: number;
  tipo: 'CREDITO' | 'DEBITO';
}

/**
 * Contrato de integração Open Finance (ex: Pluggy, Belvo, ou API direta de
 * bancos como Cora/Inter/Itaú) para conciliação bancária automática.
 *
 * Integração real: requer OPEN_FINANCE_CLIENT_ID/OPEN_FINANCE_CLIENT_SECRET
 * e o fluxo de consentimento do usuário (Open Finance Brasil) para obter o
 * accessToken da conta conectada.
 */
export interface BankGateway {
  sincronizarTransacoes(accessToken: string): Promise<TransacaoImportada[]>;
}

export const BANK_GATEWAY = Symbol('BANK_GATEWAY');
