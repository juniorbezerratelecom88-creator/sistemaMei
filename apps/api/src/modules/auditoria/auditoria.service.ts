import { Inject, Injectable } from '@nestjs/common';
import { EventoAuditoria } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { parseUserAgent } from '../../common/utils/parse-user-agent';
import {
  GEO_LOCATION_GATEWAY,
  GeoLocationGateway,
} from './geo-location-gateway.interface';

interface RegistrarParams {
  userId?: string | null;
  empresaId?: string | null;
  email: string;
  evento: EventoAuditoria;
  ip: string;
  userAgent?: string | null;
}

@Injectable()
export class AuditoriaService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(GEO_LOCATION_GATEWAY)
    private readonly geoLocation: GeoLocationGateway,
  ) {}

  async registrar(params: RegistrarParams) {
    const localizacao = await this.geoLocation.localizar(params.ip);

    return this.prisma.auditLog.create({
      data: {
        userId: params.userId ?? undefined,
        empresaId: params.empresaId ?? undefined,
        email: params.email,
        evento: params.evento,
        ip: params.ip,
        userAgent: params.userAgent ?? undefined,
        cidade: localizacao?.cidade,
        pais: localizacao?.pais,
      },
    });
  }

  async listar(empresaId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { empresaId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return logs.map((log) => ({
      ...log,
      dispositivo: parseUserAgent(log.userAgent),
    }));
  }
}
