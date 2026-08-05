import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [EmpresasController],
  providers: [EmpresasService, CloudinaryService],
  exports: [EmpresasService],
})
export class EmpresasModule {}
