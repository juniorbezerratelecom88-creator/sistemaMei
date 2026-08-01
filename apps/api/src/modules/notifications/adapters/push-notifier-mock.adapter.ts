import { Injectable, Logger } from '@nestjs/common';
import {
  EnviarNotificacaoParams,
  Notifier,
  ResultadoEnvio,
} from '../notifier.interface';

/**
 * Integração real: trocar por um provedor de push (ex: Firebase Cloud
 * Messaging) usando o token do dispositivo como destinatário.
 */
@Injectable()
export class PushNotifierMockAdapter implements Notifier {
  private readonly logger = new Logger(PushNotifierMockAdapter.name);

  async send(params: EnviarNotificacaoParams): Promise<ResultadoEnvio> {
    this.logger.log(
      `[MOCK Push] Para: ${params.destinatario} | ${params.assunto}`,
    );
    return { success: true, detalhe: 'Enviado via adapter mock' };
  }
}
