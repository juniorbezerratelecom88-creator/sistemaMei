import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../modules/auth/auth.types';

/**
 * Aplica-se a rotas de ações críticas (ex: gerar/baixar DAS, emitir nota,
 * alterar dados bancários/certificado). Exige que a conta tenha 2FA
 * habilitado. Como o login de contas com 2FA só emite o access token final
 * após a verificação do código TOTP (ver AuthService.verifyTwoFactor), a
 * simples posse de um token válido já implica que o desafio foi cumprido.
 */
@Injectable()
export class TwoFactorGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: request.user.id },
      select: { isTwoFactorEnabled: true },
    });

    if (!user.isTwoFactorEnabled) {
      throw new ForbiddenException(
        'Esta ação exige autenticação de dois fatores habilitada na conta.',
      );
    }

    return true;
  }
}
