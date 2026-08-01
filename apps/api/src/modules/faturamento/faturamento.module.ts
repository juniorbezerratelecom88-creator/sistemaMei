import { Module } from '@nestjs/common';
import { FaturamentoService } from './faturamento.service';
import { FaturamentoController } from './faturamento.controller';

@Module({
  controllers: [FaturamentoController],
  providers: [FaturamentoService],
  exports: [FaturamentoService],
})
export class FaturamentoModule {}
