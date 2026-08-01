'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Wallet2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { PageSpinner } from './ui/Spinner';
import { SESSION_EXPIRED_EVENT, clearTokens, getTokens } from '../lib/api-client';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

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
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

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
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
              <Wallet2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">Sistema MEI</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
