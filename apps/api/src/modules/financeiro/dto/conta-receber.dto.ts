import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateContaReceberDto {
  @ApiProperty()
  @IsString()
  descricao!: string;

  @ApiProperty()
  @IsString()
  categoria!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  valor!: number;

  @ApiProperty()
  @IsDateString()
  vencimento!: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  recorrente?: boolean;
}
