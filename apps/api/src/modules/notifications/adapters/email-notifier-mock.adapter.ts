import { Injectable, Logger } from '@nestjs/common';
import {
  EnviarNotificacaoParams,
  Notifier,
  ResultadoEnvio,
} from '../notifier.interface';

/**
 * Integração real: configurar SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD
 * (ou um provedor transacional como SES/SendGrid) e trocar este adapter
 * por uma implementação com nodemailer ou SDK do provedor.
 */
@Injectable()
export class EmailNotifierMockAdapter implements Notifier {
  private readonly logger = new Logger(EmailNotifierMockAdapter.name);

  async send(params: EnviarNotificacaoParams): Promise<ResultadoEnvio> {
    this.logger.log(
      `[MOCK e-mail] Para: ${params.destinatario} | Assunto: ${params.assunto}`,
    );
    return { success: true, detalhe: 'Enviado via adapter mock' };
  }
}
