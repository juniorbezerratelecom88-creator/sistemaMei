import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class TwoFactorEnableDto {
  @ApiProperty({
    description:
      'Código de 6 dígitos gerado a partir do QR code exibido em /auth/2fa/setup',
  })
  @IsString()
  @Length(6, 6)
  code!: string;
}
