import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { FluxoCaixaService } from './fluxo-caixa.service';

@ApiTags('financeiro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financeiro/fluxo-caixa')
export class FluxoCaixaController {
  constructor(private readonly fluxoCaixaService: FluxoCaixaService) {}

  @Get('realizado')
  realizado(
    @CurrentUser() user: AuthenticatedUser,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const fim = dataFim ? new Date(dataFim) : new Date();
    const inicio = dataInicio
      ? new Date(dataInicio)
      : new Date(fim.getFullYear(), fim.getMonth(), 1);
    return this.fluxoCaixaService.realizado(
      user.empresaId as string,
      inicio,
      fim,
    );
  }

  @Get('projetado')
  projetado(
    @CurrentUser() user: AuthenticatedUser,
    @Query('dias') dias?: string,
  ) {
    return this.fluxoCaixaService.projetado(
      user.empresaId as string,
      dias ? parseInt(dias, 10) : undefined,
    );
  }
}
