// Classes Tailwind escritas por extenso (não interpoladas) de propósito: o
// scanner do Tailwind precisa encontrar a string literal da classe no código
// para gerá-la no build — `bg-${color}-100` dinâmico não funcionaria.
export type AccentColor = 'indigo' | 'emerald' | 'amber' | 'violet' | 'sky' | 'teal' | 'red' | 'slate';

export const ICON_CHIP_CLASSES: Record<AccentColor, string> = {
  indigo: 'bg-indigo-100 text-indigo-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  violet: 'bg-violet-100 text-violet-600',
  sky: 'bg-sky-100 text-sky-600',
  teal: 'bg-teal-100 text-teal-600',
  red: 'bg-red-100 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
};
