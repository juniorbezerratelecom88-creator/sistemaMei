// Paleta de gráficos derivada das mesmas cores Tailwind já usadas no restante
// do painel (ver apps/web/lib/colors.ts), validada com o script de
// acessibilidade do skill de dataviz (CVD ΔE e contraste) antes de virar par
// categórico em algum gráfico:
//   positive/negative (emerald-600 / red-600): ΔE 8.6 CVD · 32.0 normal-vision — PASS
//   primary/secondary (indigo-500 / amber-600): ΔE 34.0 CVD · 39.8 normal-vision — PASS
export const CHART_COLORS = {
  positive: '#059669', // emerald-600 — entradas / saldo positivo
  negative: '#dc2626', // red-600 — saídas / saldo negativo
  primary: '#6366f1', // indigo-500 — série sequencial única (produtos, com nota)
  secondary: '#d97706', // amber-600 — segunda categoria (sem nota)
  grid: '#e2e8f0', // slate-200 — hairline de grade
  axis: '#94a3b8', // slate-400 — texto de eixo
  border: '#e2e8f0', // slate-200 — borda do tooltip
};
