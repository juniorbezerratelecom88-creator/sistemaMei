import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { VendasService } from './vendas.service';
import { CreateVendaDto } from './dto/create-venda.dto';

@ApiTags('pdv')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pdv/vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateVendaDto) {
    return this.vendasService.create(user.empresaId as string, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.vendasService.findAll(user.empresaId as string);
  }
}
