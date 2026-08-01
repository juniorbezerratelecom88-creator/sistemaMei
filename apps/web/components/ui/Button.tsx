'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-700 hover:to-violet-700 hover:shadow-md hover:scale-[1.01]',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
};

export function Button({
  variant = 'primary',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100',
        VARIANT_CLASSES[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : icon}
      {children}
    </button>
  );
}
