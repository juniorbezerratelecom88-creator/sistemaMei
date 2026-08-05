const BROWSER_PATTERNS: [RegExp, string][] = [
  [/Edg\/[\d.]+/, 'Edge'],
  [/OPR\/[\d.]+/, 'Opera'],
  [/Firefox\/[\d.]+/, 'Firefox'],
  [/Chrome\/[\d.]+/, 'Chrome'],
  [/Version\/[\d.]+.*Safari/, 'Safari'],
];

const OS_PATTERNS: [RegExp, string][] = [
  [/Windows NT/, 'Windows'],
  [/Mac OS X/, 'macOS'],
  [/Android/, 'Android'],
  [/iPhone|iPad|iOS/, 'iOS'],
  [/Linux/, 'Linux'],
];

/** Extrai um resumo legível ("Chrome · Windows") a partir do User-Agent bruto. Best-effort, não substitui uma lib de detecção completa. */
export function parseUserAgent(userAgent?: string | null): string {
  if (!userAgent) return 'Desconhecido';

  const browser =
    BROWSER_PATTERNS.find(([pattern]) => pattern.test(userAgent))?.[1] ??
    'Navegador desconhecido';
  const os =
    OS_PATTERNS.find(([pattern]) => pattern.test(userAgent))?.[1] ??
    'SO desconhecido';

  return `${browser} · ${os}`;
}
