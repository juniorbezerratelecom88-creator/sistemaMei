'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { apiFetch, setTokens } from '../../../lib/api-client';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { usePageTitle } from '../../../lib/use-page-title';

function TwoFactorForm() {
  usePageTitle('Verificação em duas etapas');
  const router = useRouter();
  const searchParams = useSearchParams();
  const twoFactorToken = searchParams.get('token') ?? '';
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Verificação em duas etapas</h1>
          <p className="text-sm text-slate-500">Digite o código do seu app autenticador</p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <input
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mb-6 w-full rounded-md border border-slate-300 px-3 py-2 text-center text-lg tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <Button type="submit" loading={loading} fullWidth>
          Confirmar
        </Button>
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
