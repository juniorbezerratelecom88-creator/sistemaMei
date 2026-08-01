import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { FiscalService } from './fiscal.service';

class GerarGuiaDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Competência deve estar no formato YYYY-MM.',
  })
  competencia?: string;
}

@ApiTags('fiscal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal/das')
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Post('gerar')
  gerar(@CurrentUser() user: AuthenticatedUser, @Body() dto: GerarGuiaDto) {
    return this.fiscalService.gerarGuiaMensal(
      user.empresaId as string,
      dto.competencia,
    );
  }

  @Get()
  listar(@CurrentUser() user: AuthenticatedUser) {
    return this.fiscalService.listar(user.empresaId as string);
  }

  @Post(':id/baixa')
  registrarPagamento(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.fiscalService.registrarPagamento(user.empresaId as string, id);
  }
}
