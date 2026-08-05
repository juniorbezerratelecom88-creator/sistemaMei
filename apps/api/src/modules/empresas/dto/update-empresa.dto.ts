import { ApiProperty } from '@nestjs/swagger';
import { AtividadeMei } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateEmpresaDto {
  @ApiProperty({ required: false, example: '12345678000199' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter 14 dígitos numéricos.' })
  cnpj?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  razaoSocial?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @ApiProperty({ enum: AtividadeMei, required: false })
  @IsOptional()
  @IsEnum(AtividadeMei)
  atividade?: AtividadeMei;

  @ApiProperty({ required: false, example: '#4f46e5' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Cor deve estar no formato hexadecimal, ex: #4f46e5.',
  })
  corPrimaria?: string;

  @ApiProperty({ required: false, example: '#7c3aed' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Cor deve estar no formato hexadecimal, ex: #7c3aed.',
  })
  corSecundaria?: string;
}
