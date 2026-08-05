import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

const LOGO_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
];

@ApiTags('empresas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @Patch('atual')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateEmpresaDto,
  ) {
    return this.empresasService.update(user.empresaId as string, dto);
  }

  @Roles(RoleName.OWNER, RoleName.ADMIN)
  @Post('logo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'logos'),
        filename: (req, file, callback) => {
          const empresaId =
            (req as { user?: AuthenticatedUser }).user?.empresaId ?? 'empresa';
          callback(
            null,
            `${empresaId}-${Date.now()}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (_req, file, callback) => {
        callback(null, LOGO_MIME_TYPES.includes(file.mimetype));
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadLogo(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Envie um arquivo de imagem (PNG, JPEG, WEBP ou SVG) de até 2MB.',
      );
    }
    return this.empresasService.updateLogo(
      user.empresaId as string,
      `/uploads/logos/${file.filename}`,
    );
  }
}
