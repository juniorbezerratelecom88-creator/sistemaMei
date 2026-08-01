import { Module } from '@nestjs/common';
import { ContasService } from './contas.service';
import { ContasController } from './contas.controller';
import { FluxoCaixaService } from './fluxo-caixa.service';
import { FluxoCaixaController } from './fluxo-caixa.controller';
import { ConciliacaoService } from './conciliacao.service';
import { ConciliacaoController } from './conciliacao.controller';
import { BANK_GATEWAY } from './bank-gateway.interface';
import { OpenFinanceMockAdapter } from './adapters/open-finance-mock.adapter';

@Module({
  controllers: [ContasController, FluxoCaixaController, ConciliacaoController],
  providers: [
    ContasService,
    FluxoCaixaService,
    ConciliacaoService,
    { provide: BANK_GATEWAY, useClass: OpenFinanceMockAdapter },
  ],
  exports: [ContasService, FluxoCaixaService],
})
export class FinanceiroModule {}
