import { Module } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { ProdutosController } from './produtos.controller';
import { CaixaService } from './caixa.service';
import { CaixaController } from './caixa.controller';
import { VendasService } from './vendas.service';
import { VendasController } from './vendas.controller';

@Module({
  controllers: [ProdutosController, CaixaController, VendasController],
  providers: [ProdutosService, CaixaService, VendasService],
  exports: [ProdutosService, CaixaService, VendasService],
})
export class PdvModule {}
