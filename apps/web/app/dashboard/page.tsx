'use client';

import { useEffect, useState } from 'react';
import type { DashboardResumo, TermometroFaturamento } from '@sistema-mei/shared-types';
import { AppShell } from '../../components/AppShell';
import { StatCard } from '../../components/StatCard';
import { apiFetch } from '../../lib/api-client';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [termometro, setTermometro] = useState<TermometroFaturamento | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<DashboardResumo>('/dashboard/resumo'),
      apiFetch<TermometroFaturamento>('/faturamento/termometro'),
    ])
      .then(([resumoData, termometroData]) => {
        setResumo(resumoData);
        setTermometro(termometroData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard.'));
  }, []);

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Dashboard</h1>

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {resumo && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Faturamento bruto (mês)" value={formatBRL(resumo.faturamentoBrutoMes)} />
          <StatCard label="Lucro líquido (mês)" value={formatBRL(resumo.lucroLiquidoMes)} />
          <StatCard label="Ticket médio" value={formatBRL(resumo.ticketMedio)} />
          <StatCard
            label="Status DAS"
            value={resumo.statusDas?.status ?? '—'}
            hint={resumo.statusDas ? `Competência ${resumo.statusDas.competencia}` : 'Nenhuma guia gerada'}
          />
        </div>
      )}

      {termometro && (
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm font-medium text-slate-500">Termômetro do teto MEI</p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full ${termometro.percentual >= 90 ? 'bg-red-500' : termometro.percentual >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(termometro.percentual, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {formatBRL(termometro.faturamentoAcumulado)} de {formatBRL(termometro.tetoProporcional)} (
            {termometro.percentual}%)
          </p>
          {termometro.alerta && (
            <p className="mt-1 text-sm font-medium text-amber-600">
              Atenção: faturamento já atingiu {termometro.alerta} do teto proporcional.
            </p>
          )}
        </div>
      )}

      {resumo && resumo.produtosMaisVendidos.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-medium text-slate-500">Produtos mais vendidos (mês)</p>
          <ul className="divide-y divide-slate-100">
            {resumo.produtosMaisVendidos.map((produto) => (
              <li key={produto.produtoId} className="flex justify-between py-2 text-sm">
                <span>{produto.nome}</span>
                <span className="text-slate-500">
                  {produto.quantidadeVendida} un · {formatBRL(produto.totalVendido)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
