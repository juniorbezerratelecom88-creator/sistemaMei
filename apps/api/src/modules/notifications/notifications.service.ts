import { Inject, Injectable } from '@nestjs/common';
import { CanalNotificacao, StatusNotificacao } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EMAIL_NOTIFIER,
  Notifier,
  PUSH_NOTIFIER,
  WHATSAPP_NOTIFIER,
} from './notifier.interface';

@Injectable()
export class NotificationsService {
  private readonly notifiers: Record<CanalNotificacao, Notifier>;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_NOTIFIER) emailNotifier: Notifier,
    @Inject(WHATSAPP_NOTIFIER) whatsappNotifier: Notifier,
    @Inject(PUSH_NOTIFIER) pushNotifier: Notifier,
  ) {
    this.notifiers = {
      [CanalNotificacao.EMAIL]: emailNotifier,
      [CanalNotificacao.WHATSAPP]: whatsappNotifier,
      [CanalNotificacao.PUSH]: pushNotifier,
    };
  }

  async notify(params: {
    empresaId: string;
    canal: CanalNotificacao;
    destinatario: string;
    assunto: string;
    mensagem: string;
    referenciaTipo?: string;
    referenciaId?: string;
  }) {
    const notifier = this.notifiers[params.canal];
    const resultado = await notifier.send({
      destinatario: params.destinatario,
      assunto: params.assunto,
      mensagem: params.mensagem,
    });

    return this.prisma.notificacaoLog.create({
      data: {
        empresaId: params.empresaId,
        canal: params.canal,
        destinatario: params.destinatario,
        assunto: params.assunto,
        status: resultado.success
          ? StatusNotificacao.ENVIADO
          : StatusNotificacao.FALHA,
        referenciaTipo: params.referenciaTipo,
        referenciaId: params.referenciaId,
      },
    });
  }

  listar(empresaId: string) {
    return this.prisma.notificacaoLog.findMany({
      where: { empresaId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
