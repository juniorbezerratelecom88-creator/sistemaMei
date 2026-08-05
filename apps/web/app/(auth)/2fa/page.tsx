'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
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
    <div className="flex min-h-screen bg-white">
      {/* Coluna do formulário */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[440px] lg:flex-none lg:px-16 xl:w-[500px]">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Verificação em duas etapas</h1>
              <p className="text-sm text-slate-500">Digite o código do seu app autenticador</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <Alert variant="error">{error}</Alert>}

            <label className="mb-1 block text-sm font-medium text-slate-700">Código</label>
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
      </div>

      {/* Coluna da imagem */}
      <div className="relative hidden flex-1 lg:block">
        <Image
          src="/office-background.jpg"
          alt="Escritório moderno"
          fill
          priority
          sizes="60vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/85 via-indigo-900/60 to-violet-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

        <div className="absolute bottom-16 left-12 right-12 xl:left-16 xl:right-16">
          <p className="mb-4 text-4xl font-bold leading-tight text-white xl:text-5xl">
            Gestão completa para o seu MEI
          </p>
          <p className="max-w-md text-lg text-indigo-100">
            Fiscal, PDV, financeiro e faturamento em um só lugar — simples, seguro e sempre à mão.
          </p>
        </div>
      </div>
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
