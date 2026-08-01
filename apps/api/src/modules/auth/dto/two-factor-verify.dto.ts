import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class TwoFactorVerifyDto {
  @ApiProperty({
    description:
      'Token temporário emitido pelo /auth/login quando 2FA está habilitado',
  })
  @IsString()
  twoFactorToken!: string;

  @ApiProperty({
    description: 'Código de 6 dígitos do app autenticador (TOTP)',
  })
  @IsString()
  @Length(6, 6)
  code!: string;
}
