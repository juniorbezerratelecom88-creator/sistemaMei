export interface EnviarNotificacaoParams {
  destinatario: string;
  assunto: string;
  mensagem: string;
}

export interface ResultadoEnvio {
  success: boolean;
  detalhe?: string;
}

export interface Notifier {
  send(params: EnviarNotificacaoParams): Promise<ResultadoEnvio>;
}

export const EMAIL_NOTIFIER = Symbol('EMAIL_NOTIFIER');
export const WHATSAPP_NOTIFIER = Symbol('WHATSAPP_NOTIFIER');
export const PUSH_NOTIFIER = Symbol('PUSH_NOTIFIER');
