const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Nota de segurança: para simplificar o scaffold, os tokens ficam em localStorage.
// Em produção, prefira cookies httpOnly + SameSite=strict (setados pelo backend)
// para reduzir a superfície de ataque a XSS.
const ACCESS_TOKEN_KEY = 'sistema-mei:accessToken';
const REFRESH_TOKEN_KEY = 'sistema-mei:refreshToken';

export function getTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export const SESSION_EXPIRED_EVENT = 'sistema-mei:session-expired';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    return null;
  }

  const data = await response.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { accessToken } = getTokens();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (!options.skipAuth && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401 && !options.skipAuth) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(`${API_URL}${path}`, { ...options, headers });
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, body.message ?? 'Erro na requisição');
  }

  // Alguns endpoints (ex: "recurso atual ou null") respondem 200 com corpo vazio
  // quando não há nada a retornar — não presumir que toda resposta OK tem JSON.
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}
