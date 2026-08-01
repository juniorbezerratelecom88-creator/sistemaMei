'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

type Variant = 'error' | 'success' | 'info';

const STYLES: Record<Variant, { wrap: string; icon: string }> = {
  error: { wrap: 'bg-red-50 text-red-700 border-red-100', icon: 'text-red-500' },
  success: { wrap: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: 'text-emerald-500' },
  info: { wrap: 'bg-sky-50 text-sky-700 border-sky-100', icon: 'text-sky-500' },
};

const ICONS: Record<Variant, LucideIcon> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function Alert({
  variant = 'info',
  children,
  onDismiss,
  autoDismiss,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  onDismiss?: () => void;
  /** Se informado (ms) e onDismiss existir, fecha o alerta automaticamente. */
  autoDismiss?: number;
  className?: string;
}) {
  const Icon = ICONS[variant];
  const styles = STYLES[variant];

  useEffect(() => {
    if (!autoDismiss || !onDismiss) return;
    const timer = setTimeout(onDismiss, autoDismiss);
    return () => clearTimeout(timer);
  }, [autoDismiss, onDismiss]);

  return (
    <div className={cn('mb-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm', styles.wrap, className)}>
      <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', styles.icon)} />
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 opacity-60 hover:opacity-100" aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
