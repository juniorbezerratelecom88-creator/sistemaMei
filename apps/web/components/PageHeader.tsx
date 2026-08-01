import type { LucideIcon } from 'lucide-react';
import { ICON_CHIP_CLASSES, type AccentColor } from '../lib/colors';
import { cn } from '../lib/cn';

export function PageHeader({
  title,
  description,
  icon: Icon,
  color = 'indigo',
  actions,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  color?: AccentColor;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={cn(
              'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
              ICON_CHIP_CLASSES[color],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
