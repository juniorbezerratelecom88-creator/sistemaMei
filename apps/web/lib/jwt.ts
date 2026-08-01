interface JwtPayload {
  email?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Decodifica o payload de um JWT (base64url) sem verificar a assinatura.
 * Uso apenas para exibir informações do próprio usuário logado (email/role)
 * na UI — a validação real acontece sempre no backend.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
