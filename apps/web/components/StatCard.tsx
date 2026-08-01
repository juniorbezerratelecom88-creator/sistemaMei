import type { LucideIcon } from 'lucide-react';
import { ICON_CHIP_CLASSES, type AccentColor } from '../lib/colors';
import { cn } from '../lib/cn';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  color = 'indigo',
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  color?: AccentColor;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        {Icon && (
          <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full', ICON_CHIP_CLASSES[color])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
