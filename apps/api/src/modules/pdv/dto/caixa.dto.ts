import { ApiProperty } from '@nestjs/swagger';
import { FormaPagamento, TipoMovimentoCaixa } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AbrirCaixaDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  valorAbertura!: number;
}

export class FecharCaixaDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  valorFechamento!: number;
}

// Movimentos manuais no caixa: apenas sangria (retirada) ou suprimento (reforço).
// O movimento do tipo VENDA é criado automaticamente pelo VendasService.
export class MovimentoCaixaDto {
  @ApiProperty({ enum: TipoMovimentoCaixa, enumName: 'TipoMovimentoCaixa' })
  @IsEnum(TipoMovimentoCaixa)
  tipo!: TipoMovimentoCaixa;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  valor!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ enum: FormaPagamento, required: false })
  @IsOptional()
  @IsEnum(FormaPagamento)
  formaPagamento?: FormaPagamento;
}
