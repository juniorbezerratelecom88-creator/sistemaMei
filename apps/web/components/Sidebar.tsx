'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearTokens } from '../lib/api-client';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pdv', label: 'PDV' },
  { href: '/fiscal', label: 'Fiscal (DAS)' },
  { href: '/notas', label: 'Notas Fiscais' },
  { href: '/financeiro', label: 'Financeiro' },
  { href: '/empresa', label: 'Empresa' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex h-screen w-56 flex-col justify-between border-r border-slate-200 bg-white px-4 py-6">
      <div>
        <p className="mb-8 px-2 text-lg font-bold text-brand-600">Sistema MEI</p>
        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                pathname === link.href
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <button
        onClick={() => {
          clearTokens();
          router.replace('/login');
        }}
        className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-500 hover:bg-slate-100"
      >
        Sair
      </button>
    </aside>
  );
}
