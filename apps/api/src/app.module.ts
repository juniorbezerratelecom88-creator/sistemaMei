import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { FiscalModule } from './modules/fiscal/fiscal.module';
import { NfeModule } from './modules/nfe/nfe.module';
import { PdvModule } from './modules/pdv/pdv.module';
import { FaturamentoModule } from './modules/faturamento/faturamento.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';

@Module({
  imports: [
    // O .env do projeto fica na raiz do monorepo (junto do docker-compose.yml);
    // apps/api/.env é aceito também, para o caso de builds/containers isolados.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: (config.get<number>('THROTTLE_TTL') ?? 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT') ?? 100,
        },
      ],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Redis gerenciado (Render, Upstash, etc.) expõe uma única URL com
        // usuário/senha; REDIS_HOST/REDIS_PORT seguem valendo para o Redis
        // local do docker-compose, que não tem autenticação.
        const redisUrl = config.get<string>('REDIS_URL');
        if (redisUrl) {
          const url = new URL(redisUrl);
          return {
            connection: {
              host: url.hostname,
              port: Number(url.port) || 6379,
              username: url.username || undefined,
              password: url.password || undefined,
              tls: url.protocol === 'rediss:' ? {} : undefined,
            },
          };
        }
        return {
          connection: {
            host: config.get<string>('REDIS_HOST') ?? 'localhost',
            port: config.get<number>('REDIS_PORT') ?? 6379,
          },
        };
      },
    }),
    PrismaModule,
    CryptoModule,
    AuthModule,
    UsersModule,
    EmpresasModule,
    FiscalModule,
    NfeModule,
    PdvModule,
    FaturamentoModule,
    FinanceiroModule,
    NotificationsModule,
    DashboardModule,
    AuditoriaModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
