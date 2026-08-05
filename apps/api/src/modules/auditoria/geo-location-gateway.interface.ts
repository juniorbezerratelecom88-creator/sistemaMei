export interface GeoLocationResult {
  cidade?: string;
  pais?: string;
}

/**
 * Contrato de integração com um serviço de geolocalização por IP
 * (ex: ipapi.co, ipinfo.io, MaxMind GeoLite2).
 *
 * Integração real: requer chave de API do provedor escolhido. IPs de rede
 * local/privada nunca retornam localização, nem em produção com um provedor
 * real - isso não é uma limitação do mock.
 */
export interface GeoLocationGateway {
  localizar(ip: string): Promise<GeoLocationResult | null>;
}

export const GEO_LOCATION_GATEWAY = Symbol('GEO_LOCATION_GATEWAY');
