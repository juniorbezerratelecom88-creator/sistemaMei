const UNITS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/** Converte strings simples como "15m", "7d", "60s" em milissegundos. */
export default function ms(value: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Formato de duração inválido: "${value}"`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNITS[unit];
}
