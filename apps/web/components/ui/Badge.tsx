import { cn } from '../../lib/cn';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
  neutral: 'bg-slate-100 text-slate-600',
};

export function Badge({
  variant = 'neutral',
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', VARIANT_CLASSES[variant], className)}>
      {children}
    </span>
  );
}
