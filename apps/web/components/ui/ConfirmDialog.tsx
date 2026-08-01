'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  variant = 'primary',
  loading = false,
  children,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'primary' | 'danger';
  loading?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="mb-1 text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="mb-4 text-sm text-slate-500">{description}</p>}
        {children && <div className="mb-6">{children}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
