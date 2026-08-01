import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { createHash, randomBytes } from 'crypto';
import ms from '../../common/utils/ms';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './auth.types';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly crypto: CryptoService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });

    return this.issueTokenPair(user.id, user.email, user.role, user.empresaId);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (user.isTwoFactorEnabled) {
      const twoFactorToken = this.jwt.sign(
        { sub: user.id, stage: '2fa' },
        {
          secret: this.config.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '5m',
        },
      );
      return { requiresTwoFactor: true, twoFactorToken };
    }

    return this.issueTokenPair(user.id, user.email, user.role, user.empresaId);
  }

  async verifyTwoFactorLogin(twoFactorToken: string, code: string) {
    let decoded: { sub: string; stage: string };
    try {
      decoded = this.jwt.verify(twoFactorToken, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Token de 2FA inválido ou expirado.');
    }

    if (decoded.stage !== '2fa') {
      throw new UnauthorizedException('Token de 2FA inválido.');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: decoded.sub },
    });

    if (!user.twoFactorSecretCipher) {
      throw new UnauthorizedException('2FA não configurado para esta conta.');
    }

    const secret = this.crypto.decrypt(user.twoFactorSecretCipher);
    const valid = authenticator.check(code, secret);
    if (!valid) {
      throw new UnauthorizedException('Código de verificação inválido.');
    }

    return this.issueTokenPair(user.id, user.email, user.role, user.empresaId);
  }

  async generateTwoFactorSetup(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const secret = authenticator.generateSecret();
    const appName =
      this.config.get<string>('TWO_FACTOR_APP_NAME') ?? 'Sistema MEI';
    const otpauthUrl = authenticator.keyuri(user.email, appName, secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Guarda o segredo cifrado como "pendente" - só é ativado após /2fa/enable confirmar o código.
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecretCipher: this.crypto.encrypt(secret) },
    });

    return { otpauthUrl, qrCodeDataUrl };
  }

  async enableTwoFactor(userId: string, code: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!user.twoFactorSecretCipher) {
      throw new UnauthorizedException(
        'Chame /auth/2fa/setup antes de habilitar o 2FA.',
      );
    }

    const secret = this.crypto.decrypt(user.twoFactorSecretCipher);
    if (!authenticator.check(code, secret)) {
      throw new UnauthorizedException('Código de verificação inválido.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    return { enabled: true };
  }

  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    // Rotação: revoga o token usado e emite um novo par.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.issueTokenPair(
      stored.user.id,
      stored.user.email,
      stored.user.role,
      stored.user.empresaId,
    );
  }

  async logout(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    role: JwtPayload['role'],
    empresaId: string | null,
  ): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, email, role, empresaId };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });

    const rawRefreshToken = randomBytes(48).toString('hex');
    const refreshExpiresIn =
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(rawRefreshToken),
        expiresAt: new Date(Date.now() + ms(refreshExpiresIn)),
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
