'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { getTokens } from '../lib/api-client';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex">
      <Sidebar />
      <main className="min-h-screen flex-1 bg-slate-50 p-8">{children}</main>
    </div>
  );
}
