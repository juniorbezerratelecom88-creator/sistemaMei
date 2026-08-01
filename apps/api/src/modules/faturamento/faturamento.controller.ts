import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { FaturamentoService } from './faturamento.service';

function parseAno(ano?: string): number | undefined {
  return ano ? parseInt(ano, 10) : undefined;
}

@ApiTags('faturamento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('faturamento')
export class FaturamentoController {
  constructor(private readonly faturamentoService: FaturamentoService) {}

  @Get('termometro')
  termometro(
    @CurrentUser() user: AuthenticatedUser,
    @Query('ano') ano?: string,
  ) {
    return this.faturamentoService.termometro(
      user.empresaId as string,
      parseAno(ano),
    );
  }

  @Get('dasn')
  dasn(@CurrentUser() user: AuthenticatedUser, @Query('ano') ano?: string) {
    return this.faturamentoService.relatorioDasn(
      user.empresaId as string,
      parseAno(ano),
    );
  }
}
