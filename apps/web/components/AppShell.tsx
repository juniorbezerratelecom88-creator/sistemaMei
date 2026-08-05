'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Empresa } from '@sistema-mei/shared-types';
import { Building2, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { PageSpinner } from './ui/Spinner';
import { SESSION_EXPIRED_EVENT, apiFetch, clearTokens, getTokens } from '../lib/api-client';
import { applyBrandTheme } from '../lib/apply-brand-theme';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);

  useEffect(() => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    apiFetch<Empresa>('/empresas/atual')
      .then((data) => {
        setEmpresa(data);
        applyBrandTheme(data);
      })
      .catch(() => {
        // usuário pode ainda não ter empresa cadastrada - mantém o tema padrão
      });
  }, [ready]);

  useEffect(() => {
    function handleSessionExpired() {
      clearTokens();
      router.replace('/login?expired=1');
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [router]);

  if (!ready) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/40 lg:flex">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} empresa={empresa} />

      <div className="flex-1">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-500 hover:text-slate-900"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {empresa?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${API_URL}${empresa.logoUrl}`}
                alt={empresa.razaoSocial}
                className="h-7 w-7 flex-shrink-0 rounded-md object-cover"
              />
            ) : (
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                style={{ backgroundImage: 'linear-gradient(to bottom right, var(--brand-primary), var(--brand-secondary))' }}
              >
                <Building2 className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="truncate text-sm font-bold text-slate-900">
              {empresa?.nomeFantasia || empresa?.razaoSocial || 'Sistema MEI'}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
