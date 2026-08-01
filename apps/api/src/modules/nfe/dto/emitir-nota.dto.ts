import { ApiProperty } from '@nestjs/swagger';
import { TipoNota } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class EmitirNotaDto {
  @ApiProperty({ enum: TipoNota })
  @IsEnum(TipoNota)
  tipo!: TipoNota;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clienteNome?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clienteDocumento?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  clienteEmail?: string;
}
