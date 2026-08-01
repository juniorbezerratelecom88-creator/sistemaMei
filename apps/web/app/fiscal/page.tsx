'use client';

import { useEffect, useState } from 'react';
import type { DasGuia } from '@sistema-mei/shared-types';
import { AppShell } from '../../components/AppShell';
import { apiFetch } from '../../lib/api-client';

function formatBRL(value: string | number) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FiscalPage() {
  const [guias, setGuias] = useState<DasGuia[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    setGuias(await apiFetch<DasGuia[]>('/fiscal/das'));
  }

  useEffect(() => {
    carregar().catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar DAS.'));
  }, []);

  async function gerarGuia() {
    setError(null);
    try {
      await apiFetch('/fiscal/das/gerar', { method: 'POST', body: JSON.stringify({}) });
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar guia.');
    }
  }

  async function darBaixa(id: string) {
    setError(null);
    try {
      await apiFetch(`/fiscal/das/${id}/baixa`, { method: 'POST' });
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao dar baixa.');
    }
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Fiscal — DAS</h1>
        <button
          onClick={gerarGuia}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Gerar guia do mês
        </button>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Competência</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {guias.map((guia) => (
              <tr key={guia.id}>
                <td className="px-4 py-3">{guia.competencia}</td>
                <td className="px-4 py-3">{formatBRL(guia.valor)}</td>
                <td className="px-4 py-3">{new Date(guia.vencimento).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      guia.status === 'PAGO'
                        ? 'bg-emerald-50 text-emerald-700'
                        : guia.status === 'VENCIDO'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {guia.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {guia.status !== 'PAGO' && (
                    <button
                      onClick={() => darBaixa(guia.id)}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Registrar pagamento
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {guias.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Nenhuma guia gerada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
