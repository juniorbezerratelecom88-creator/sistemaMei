import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { GEO_LOCATION_GATEWAY } from './geo-location-gateway.interface';
import { GeoLocationMockAdapter } from './adapters/geo-location-mock.adapter';

@Module({
  controllers: [AuditoriaController],
  providers: [
    AuditoriaService,
    { provide: GEO_LOCATION_GATEWAY, useClass: GeoLocationMockAdapter },
  ],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
