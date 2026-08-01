import * as argon2 from 'argon2';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { RoleName } from '@prisma/client';

describe('AuthService', () => {
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
    refreshToken: { create: jest.Mock };
  };
  let jwt: { sign: jest.Mock };
  let config: { get: jest.Mock };
  let crypto: CryptoService;
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
      refreshToken: { create: jest.fn().mockResolvedValue({}) },
    };
    jwt = { sign: jest.fn().mockReturnValue('fake-access-token') };
    config = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
        return undefined;
      }),
    };
    crypto = new CryptoService(config as any);
    crypto.onModuleInit();

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as any,
      config as any,
      crypto,
    );
  });

  it('rejeita login com senha incorreta', async () => {
    const passwordHash = await argon2.hash('senha-correta', {
      type: argon2.argon2id,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash,
      role: RoleName.OPERADOR,
      empresaId: null,
      isTwoFactorEnabled: false,
    });

    await expect(
      service.login({ email: 'a@b.com', password: 'senha-errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('emite tokens ao logar com credenciais corretas e sem 2FA', async () => {
    const passwordHash = await argon2.hash('senha-correta', {
      type: argon2.argon2id,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash,
      role: RoleName.OPERADOR,
      empresaId: null,
      isTwoFactorEnabled: false,
    });

    const result = await service.login({
      email: 'a@b.com',
      password: 'senha-correta',
    });

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(prisma.refreshToken.create).toHaveBeenCalled();
  });

  it('exige verificação 2FA quando habilitado, sem emitir tokens finais', async () => {
    const passwordHash = await argon2.hash('senha-correta', {
      type: argon2.argon2id,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash,
      role: RoleName.OPERADOR,
      empresaId: null,
      isTwoFactorEnabled: true,
    });

    const result = await service.login({
      email: 'a@b.com',
      password: 'senha-correta',
    });

    expect(result).toEqual({
      requiresTwoFactor: true,
      twoFactorToken: 'fake-access-token',
    });
    expect(prisma.refreshToken.create).not.toHaveBeenCalled();
  });
});
