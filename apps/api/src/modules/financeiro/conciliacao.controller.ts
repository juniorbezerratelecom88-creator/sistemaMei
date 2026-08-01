import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { ConciliacaoService } from './conciliacao.service';
import { ConectarContaBancariaDto } from './dto/conectar-conta-bancaria.dto';

@ApiTags('financeiro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financeiro/contas-bancarias')
export class ConciliacaoController {
  constructor(private readonly conciliacaoService: ConciliacaoService) {}

  @Post()
  conectar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConectarContaBancariaDto,
  ) {
    return this.conciliacaoService.conectarConta(user.empresaId as string, dto);
  }

  @Get()
  listar(@CurrentUser() user: AuthenticatedUser) {
    return this.conciliacaoService.listarContas(user.empresaId as string);
  }

  @Post(':id/sincronizar')
  sincronizar(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.conciliacaoService.sincronizar(user.empresaId as string, id);
  }

  @Get(':id/transacoes')
  transacoes(@Param('id') id: string) {
    return this.conciliacaoService.listarTransacoes(id);
  }
}
