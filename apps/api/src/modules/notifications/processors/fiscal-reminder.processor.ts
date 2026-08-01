import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CanalNotificacao } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { FISCAL_REMINDERS_QUEUE } from '../../fiscal/fiscal.constants';
import { NotificationsService } from '../notifications.service';

interface LembreteDasPayload {
  dasGuiaId: string;
}

@Processor(FISCAL_REMINDERS_QUEUE)
export class FiscalReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(FiscalReminderProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<LembreteDasPayload>) {
    const guia = await this.prisma.dasGuia.findUnique({
      where: { id: job.data.dasGuiaId },
      include: { empresa: { include: { users: true } } },
    });

    if (!guia || guia.status === 'PAGO') return;

    const assunto = `DAS vence em breve - competência ${guia.competencia}`;
    const mensagem = `O DAS da competência ${guia.competencia} no valor de R$ ${Number(guia.valor).toFixed(2)} vence em ${guia.vencimento.toLocaleDateString('pt-BR')}.`;

    for (const user of guia.empresa.users) {
      await this.notifications.notify({
        empresaId: guia.empresaId,
        canal: CanalNotificacao.EMAIL,
        destinatario: user.email,
        assunto,
        mensagem,
        referenciaTipo: 'DasGuia',
        referenciaId: guia.id,
      });

      if (user.telefone) {
        await this.notifications.notify({
          empresaId: guia.empresaId,
          canal: CanalNotificacao.WHATSAPP,
          destinatario: user.telefone,
          assunto,
          mensagem,
          referenciaTipo: 'DasGuia',
          referenciaId: guia.id,
        });
      }
    }

    this.logger.log(`Lembretes de DAS enviados para guia ${guia.id}`);
  }
}
