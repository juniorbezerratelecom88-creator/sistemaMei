import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  GeoLocationGateway,
  GeoLocationResult,
} from '../geo-location-gateway.interface';

// Cidades usadas só para demonstrar o formato do resultado em IPs públicos "de mentira".
const CIDADES_MOCK: GeoLocationResult[] = [
  { cidade: 'São Paulo', pais: 'BR' },
  { cidade: 'Rio de Janeiro', pais: 'BR' },
  { cidade: 'Belo Horizonte', pais: 'BR' },
  { cidade: 'Curitiba', pais: 'BR' },
  { cidade: 'Lisboa', pais: 'PT' },
];

function isIpPrivadoOuLocal(ip: string): boolean {
  const normalizado = ip.replace(/^::ffff:/, '');

  if (
    normalizado === '::1' ||
    normalizado === '127.0.0.1' ||
    normalizado === 'localhost'
  )
    return true;

  const partes = normalizado.split('.').map(Number);
  if (partes.length !== 4 || partes.some(Number.isNaN)) return false; // não parece IPv4, trata como não-local

  const [a, b] = partes;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 127) return true; // loopback

  return false;
}

@Injectable()
export class GeoLocationMockAdapter implements GeoLocationGateway {
  private readonly logger = new Logger(GeoLocationMockAdapter.name);

  async localizar(ip: string): Promise<GeoLocationResult | null> {
    if (isIpPrivadoOuLocal(ip)) {
      // Igual a um provedor real: IP de rede local não tem localização geográfica.
      return null;
    }

    this.logger.log(
      `[MOCK] Consultando geolocalização para ${ip}. Trocar por ipapi.co/MaxMind GeoLite2 em produção.`,
    );

    const hash = createHash('md5').update(ip).digest('hex');
    const indice = parseInt(hash.slice(0, 4), 16) % CIDADES_MOCK.length;
    return CIDADES_MOCK[indice];
  }
}
