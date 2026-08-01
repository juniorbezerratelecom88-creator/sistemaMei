import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';

@ApiTags('empresas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEmpresaDto,
  ) {
    return this.empresasService.create(user.id, dto);
  }

  @Get('atual')
  findCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.empresasService.findById(user.empresaId as string);
  }
}
