import { cn } from '../../lib/cn';

export function Spinner({ className }: { className?: string }) {
  // O tamanho (h-*/w-*) vem inteiramente de `className` para nunca colidir com
  // um default fixo aqui dentro — duas classes de tamanho no mesmo elemento
  // fazem o Tailwind aplicar nenhuma delas de forma confiável.
  return (
    <svg className={cn('animate-spin text-current', className ?? 'h-5 w-5')} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50/40">
      <Spinner className="h-8 w-8 text-indigo-600" />
    </div>
  );
}
