import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NfeService } from './nfe.service';
import { NfeController } from './nfe.controller';
import { NFE_GATEWAY } from './nfe-gateway.interface';
import { NfeGatewayMockAdapter } from './adapters/nfe-gateway-mock.adapter';
import { NFE_NOTIFICATIONS_QUEUE } from './nfe.constants';

@Module({
  imports: [BullModule.registerQueue({ name: NFE_NOTIFICATIONS_QUEUE })],
  controllers: [NfeController],
  providers: [
    NfeService,
    { provide: NFE_GATEWAY, useClass: NfeGatewayMockAdapter },
  ],
  exports: [NfeService],
})
export class NfeModule {}
