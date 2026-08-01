import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { ContasService } from './contas.service';
import { CreateContaPagarDto } from './dto/conta-pagar.dto';
import { CreateContaReceberDto } from './dto/conta-receber.dto';

@ApiTags('financeiro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financeiro')
export class ContasController {
  constructor(private readonly contasService: ContasService) {}

  @Post('contas-pagar')
  criarContaPagar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContaPagarDto,
  ) {
    return this.contasService.criarContaPagar(user.empresaId as string, dto);
  }

  @Get('contas-pagar')
  listarContasPagar(@CurrentUser() user: AuthenticatedUser) {
    return this.contasService.listarContasPagar(user.empresaId as string);
  }

  @Post('contas-pagar/:id/pagar')
  pagarContaPagar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.contasService.pagarContaPagar(user.empresaId as string, id);
  }

  @Post('contas-receber')
  criarContaReceber(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContaReceberDto,
  ) {
    return this.contasService.criarContaReceber(user.empresaId as string, dto);
  }

  @Get('contas-receber')
  listarContasReceber(@CurrentUser() user: AuthenticatedUser) {
    return this.contasService.listarContasReceber(user.empresaId as string);
  }

  @Post('contas-receber/:id/receber')
  receberContaReceber(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.contasService.receberContaReceber(user.empresaId as string, id);
  }
}
