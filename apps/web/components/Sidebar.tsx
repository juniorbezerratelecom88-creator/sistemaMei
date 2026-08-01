'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Receipt,
  ShoppingCart,
  Wallet,
  Wallet2,
  X,
} from 'lucide-react';
import { clearTokens, getTokens } from '../lib/api-client';
import { decodeJwtPayload } from '../lib/jwt';
import { cn } from '../lib/cn';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pdv', label: 'PDV', icon: ShoppingCart },
  { href: '/fiscal', label: 'Fiscal (DAS)', icon: Receipt },
  { href: '/notas', label: 'Notas Fiscais', icon: FileText },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/empresa', label: 'Empresa', icon: Building2 },
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { accessToken } = getTokens();
  const payload = accessToken ? decodeJwtPayload(accessToken) : null;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-slate-900 px-4 py-6 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div>
          <div className="mb-8 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                <Wallet2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Sistema MEI</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden" aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4">
          {payload?.email && (
            <div className="mb-2 px-3">
              <p className="truncate text-sm font-medium text-white">{payload.email}</p>
              {payload.role && <p className="text-xs text-slate-400">{String(payload.role)}</p>}
            </div>
          )}
          <button
            onClick={() => {
              clearTokens();
              router.replace('/login');
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
