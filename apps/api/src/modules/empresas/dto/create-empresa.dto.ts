import { ApiProperty } from '@nestjs/swagger';
import { AtividadeMei } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateEmpresaDto {
  @ApiProperty({ example: '12345678000199' })
  @IsString()
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter 14 dígitos numéricos.' })
  cnpj!: string;

  @ApiProperty()
  @IsString()
  razaoSocial!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @ApiProperty({ enum: AtividadeMei })
  @IsEnum(AtividadeMei)
  atividade!: AtividadeMei;

  @ApiProperty()
  @IsDateString()
  dataAbertura!: string;
}
