import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CanalNotificacao } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { NFE_NOTIFICATIONS_QUEUE } from '../../nfe/nfe.constants';
import { NotificationsService } from '../notifications.service';

interface EnvioNotaPayload {
  notaFiscalId: string;
}

@Processor(NFE_NOTIFICATIONS_QUEUE)
export class NfeNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NfeNotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<EnvioNotaPayload>) {
    const nota = await this.prisma.notaFiscal.findUnique({
      where: { id: job.data.notaFiscalId },
    });

    if (!nota || !nota.clienteEmail) return;

    await this.notifications.notify({
      empresaId: nota.empresaId,
      canal: CanalNotificacao.EMAIL,
      destinatario: nota.clienteEmail,
      assunto: `Nota fiscal ${nota.numero}/${nota.serie} emitida`,
      mensagem: `Sua nota fiscal foi emitida. XML: ${nota.xmlUrl} | PDF: ${nota.pdfUrl}`,
      referenciaTipo: 'NotaFiscal',
      referenciaId: nota.id,
    });

    this.logger.log(`Nota fiscal ${nota.id} enviada ao cliente por e-mail.`);
  }
}
