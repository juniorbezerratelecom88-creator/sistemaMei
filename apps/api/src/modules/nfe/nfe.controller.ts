import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { NfeService } from './nfe.service';
import { EmitirNotaDto } from './dto/emitir-nota.dto';

@ApiTags('nfe')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nfe')
export class NfeController {
  constructor(private readonly nfeService: NfeService) {}

  @Post('vendas/:vendaId/emitir')
  emitir(
    @CurrentUser() user: AuthenticatedUser,
    @Param('vendaId') vendaId: string,
    @Body() dto: EmitirNotaDto,
  ) {
    return this.nfeService.emitirParaVenda(
      user.empresaId as string,
      vendaId,
      dto,
    );
  }

  @Get()
  listar(@CurrentUser() user: AuthenticatedUser) {
    return this.nfeService.listar(user.empresaId as string);
  }
}
