import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { FiscalReminderProcessor } from './processors/fiscal-reminder.processor';
import { NfeNotificationProcessor } from './processors/nfe-notification.processor';
import {
  EMAIL_NOTIFIER,
  PUSH_NOTIFIER,
  WHATSAPP_NOTIFIER,
} from './notifier.interface';
import { EmailNotifierMockAdapter } from './adapters/email-notifier-mock.adapter';
import { WhatsappNotifierMockAdapter } from './adapters/whatsapp-notifier-mock.adapter';
import { PushNotifierMockAdapter } from './adapters/push-notifier-mock.adapter';
import { FISCAL_REMINDERS_QUEUE } from '../fiscal/fiscal.constants';
import { NFE_NOTIFICATIONS_QUEUE } from '../nfe/nfe.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: FISCAL_REMINDERS_QUEUE },
      { name: NFE_NOTIFICATIONS_QUEUE },
    ),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    FiscalReminderProcessor,
    NfeNotificationProcessor,
    { provide: EMAIL_NOTIFIER, useClass: EmailNotifierMockAdapter },
    { provide: WHATSAPP_NOTIFIER, useClass: WhatsappNotifierMockAdapter },
    { provide: PUSH_NOTIFIER, useClass: PushNotifierMockAdapter },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
