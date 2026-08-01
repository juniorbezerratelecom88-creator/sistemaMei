'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, setTokens } from '../../../lib/api-client';

function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const twoFactorToken = searchParams.get('token') ?? '';
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const result = await apiFetch<{ accessToken: string; refreshToken: string }>(
        '/auth/2fa/login-verify',
        {
          method: 'POST',
          body: JSON.stringify({ twoFactorToken, code }),
          skipAuth: true,
        },
      );
      setTokens(result.accessToken, result.refreshToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-bold text-brand-700">Verificação em duas etapas</h1>
        <p className="mb-6 text-sm text-slate-500">Digite o código do seu app autenticador</p>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <input
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mb-6 w-full rounded-md border border-slate-300 px-3 py-2 text-center text-lg tracking-widest"
        />

        <button
          type="submit"
          className="w-full rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Confirmar
        </button>
      </form>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={null}>
      <TwoFactorForm />
    </Suspense>
  );
}
