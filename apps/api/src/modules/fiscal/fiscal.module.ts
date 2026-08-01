import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FiscalService } from './fiscal.service';
import { FiscalController } from './fiscal.controller';
import { GOV_BR_GATEWAY } from './gov-br-gateway.interface';
import { SimeiGatewayMockAdapter } from './adapters/simei-gateway-mock.adapter';
import { FISCAL_REMINDERS_QUEUE } from './fiscal.constants';

@Module({
  imports: [BullModule.registerQueue({ name: FISCAL_REMINDERS_QUEUE })],
  controllers: [FiscalController],
  providers: [
    FiscalService,
    { provide: GOV_BR_GATEWAY, useClass: SimeiGatewayMockAdapter },
  ],
  exports: [FiscalService],
})
export class FiscalModule {}
