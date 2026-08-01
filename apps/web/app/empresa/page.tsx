'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { AtividadeMei, Empresa } from '@sistema-mei/shared-types';
import { AppShell } from '../../components/AppShell';
import { apiFetch } from '../../lib/api-client';

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [atividade, setAtividade] = useState<AtividadeMei>('COMERCIO' as AtividadeMei);
  const [dataAbertura, setDataAbertura] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Empresa>('/empresas/atual')
      .then(setEmpresa)
      .catch(() => setEmpresa(null));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const nova = await apiFetch<Empresa>('/empresas', {
        method: 'POST',
        body: JSON.stringify({ cnpj, razaoSocial, atividade, dataAbertura }),
      });
      setEmpresa(nova);
      setMessage('Empresa criada. Faça login novamente para atualizar suas permissões.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empresa.');
    }
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Empresa</h1>

      {empresa ? (
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
          {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          <label className="mb-1 block text-sm font-medium">CNPJ</label>
          <input
            required
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="Somente números"
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <label className="mb-1 block text-sm font-medium">Razão social</label>
          <input
            required
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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

          <button
            type="submit"
            className="w-full rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Cadastrar empresa
          </button>
        </form>
      )}
    </AppShell>
  );
}
