import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { CaixaService } from './caixa.service';
import {
  AbrirCaixaDto,
  FecharCaixaDto,
  MovimentoCaixaDto,
} from './dto/caixa.dto';

@ApiTags('pdv')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pdv/caixa')
export class CaixaController {
  constructor(private readonly caixaService: CaixaService) {}

  @Post('abrir')
  abrir(@CurrentUser() user: AuthenticatedUser, @Body() dto: AbrirCaixaDto) {
    return this.caixaService.abrir(user.empresaId as string, user.id, dto);
  }

  @Get('atual')
  atual(@CurrentUser() user: AuthenticatedUser) {
    return this.caixaService.atual(user.empresaId as string);
  }

  @Post(':id/movimentos')
  registrarMovimento(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: MovimentoCaixaDto,
  ) {
    return this.caixaService.registrarMovimento(
      user.empresaId as string,
      id,
      dto,
    );
  }

  @Post(':id/fechar')
  fechar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: FecharCaixaDto,
  ) {
    return this.caixaService.fechar(user.empresaId as string, id, dto);
  }
}
