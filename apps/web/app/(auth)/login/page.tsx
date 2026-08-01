'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wallet2 } from 'lucide-react';
import { apiFetch, setTokens } from '../../../lib/api-client';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { usePageTitle } from '../../../lib/use-page-title';

function LoginForm() {
  usePageTitle('Entrar');
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await apiFetch<{
        accessToken?: string;
        refreshToken?: string;
        requiresTwoFactor?: boolean;
        twoFactorToken?: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      });

      if (result.requiresTwoFactor && result.twoFactorToken) {
        router.push(`/2fa?token=${encodeURIComponent(result.twoFactorToken)}`);
        return;
      }

      if (result.accessToken && result.refreshToken) {
        setTokens(result.accessToken, result.refreshToken);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar.');
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
            <Wallet2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Sistema MEI</h1>
          <p className="text-sm text-slate-500">Entre com sua conta</p>
        </div>

        {expired && (
          <Alert variant="info">Sua sessão expirou. Faça login novamente.</Alert>
        )}
        {error && <Alert variant="error">{error}</Alert>}

        <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <Button type="submit" loading={loading} fullWidth>
          Entrar
        </Button>

        <p className="mt-4 text-center text-xs text-slate-400">
          Login de teste (seed): admin@sistemamei.com.br / Senha@Forte123
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
