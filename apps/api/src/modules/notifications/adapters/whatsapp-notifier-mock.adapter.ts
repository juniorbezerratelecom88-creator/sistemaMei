import { Injectable, Logger } from '@nestjs/common';
import {
  EnviarNotificacaoParams,
  Notifier,
  ResultadoEnvio,
} from '../notifier.interface';

/**
 * Integração real: configurar WHATSAPP_API_TOKEN/WHATSAPP_PHONE_NUMBER_ID
 * (WhatsApp Business Cloud API) e trocar este adapter por chamadas HTTP reais.
 */
@Injectable()
export class WhatsappNotifierMockAdapter implements Notifier {
  private readonly logger = new Logger(WhatsappNotifierMockAdapter.name);

  async send(params: EnviarNotificacaoParams): Promise<ResultadoEnvio> {
    this.logger.log(
      `[MOCK WhatsApp] Para: ${params.destinatario} | ${params.mensagem}`,
    );
    return { success: true, detalhe: 'Enviado via adapter mock' };
  }
}
