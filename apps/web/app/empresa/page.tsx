'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { AtividadeMei, Empresa } from '@sistema-mei/shared-types';
import { Building2 } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { PageHeader } from '../../components/PageHeader';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { apiFetch } from '../../lib/api-client';
import { usePageTitle } from '../../lib/use-page-title';

export default function EmpresaPage() {
  usePageTitle('Empresa');
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [atividade, setAtividade] = useState<AtividadeMei>('COMERCIO' as AtividadeMei);
  const [dataAbertura, setDataAbertura] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    apiFetch<Empresa>('/empresas/atual')
      .then(setEmpresa)
      .catch(() => setEmpresa(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSalvando(true);
    try {
      const nova = await apiFetch<Empresa>('/empresas', {
        method: 'POST',
        body: JSON.stringify({ cnpj, razaoSocial, atividade, dataAbertura }),
      });
      setEmpresa(nova);
      setMessage('Empresa criada. Faça login novamente para atualizar suas permissões.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empresa.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell>
      <PageHeader title="Empresa" description="Dados cadastrais do seu MEI" icon={Building2} color="teal" />

      {loading ? (
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="mb-4 h-5 w-48" />
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-5 w-36" />
        </div>
      ) : empresa ? (
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Razão social</p>
          <p className="mb-3 text-lg font-medium">{empresa.razaoSocial}</p>
          <p className="text-sm text-slate-500">CNPJ</p>
          <p className="mb-3 text-lg font-medium">{empresa.cnpj}</p>
          <p className="text-sm text-slate-500">Atividade</p>
          <p className="text-lg font-medium">{empresa.atividade}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm text-slate-500">
            Cadastre os dados do seu MEI para começar a usar o sistema.
          </p>
          {error && <Alert variant="error">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <label className="mb-1 block text-sm font-medium">CNPJ</label>
          <input
            required
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="Somente números"
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />

          <label className="mb-1 block text-sm font-medium">Razão social</label>
          <input
            required
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />

          <label className="mb-1 block text-sm font-medium">Atividade</label>
          <select
            value={atividade}
            onChange={(e) => setAtividade(e.target.value as AtividadeMei)}
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="COMERCIO">Comércio</option>
            <option value="INDUSTRIA">Indústria</option>
            <option value="SERVICOS">Serviços</option>
          </select>

          <label className="mb-1 block text-sm font-medium">Data de abertura</label>
          <input
            type="date"
            required
            value={dataAbertura}
            onChange={(e) => setDataAbertura(e.target.value)}
            className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <Button type="submit" loading={salvando} fullWidth>
            Cadastrar empresa
          </Button>
        </form>
      )}
    </AppShell>
  );
}
