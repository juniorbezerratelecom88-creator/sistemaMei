import { ApiProperty } from '@nestjs/swagger';
import { FormaPagamento } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class VendaItemDto {
  @ApiProperty()
  @IsString()
  produtoId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantidade!: number;
}

export class CreateVendaDto {
  @ApiProperty({ type: [VendaItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VendaItemDto)
  itens!: VendaItemDto[];

  @ApiProperty({ enum: FormaPagamento })
  @IsEnum(FormaPagamento)
  formaPagamento!: FormaPagamento;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clienteNome?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clienteDocumento?: string;
}
