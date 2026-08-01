import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConectarContaBancariaDto {
  @ApiProperty({
    example: 'mock',
    description: 'Provedor Open Finance (ex: pluggy, belvo, mock)',
  })
  @IsString()
  provider!: string;

  @ApiProperty()
  @IsString()
  apelido!: string;

  @ApiProperty({
    description:
      'Token de acesso recebido do fluxo OAuth do provedor Open Finance',
  })
  @IsString()
  accessToken!: string;
}
