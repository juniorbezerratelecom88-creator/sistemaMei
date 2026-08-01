'use client';

import { useEffect, useState } from 'react';
import type { DashboardResumo, TermometroFaturamento } from '@sistema-mei/shared-types';
import { DollarSign, LayoutDashboard, PiggyBank, Receipt, ShoppingBag } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { apiFetch } from '../../lib/api-client';
import { usePageTitle } from '../../lib/use-page-title';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardPage() {
  usePageTitle('Dashboard');
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [termometro, setTermometro] = useState<TermometroFaturamento | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<DashboardResumo>('/dashboard/resumo'),
      apiFetch<TermometroFaturamento>('/faturamento/termometro'),
    ])
      .then(([resumoData, termometroData]) => {
        setResumo(resumoData);
        setTermometro(termometroData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu negócio"
        icon={LayoutDashboard}
        color="indigo"
      />

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        resumo && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Faturamento bruto (mês)"
              value={formatBRL(resumo.faturamentoBrutoMes)}
              icon={DollarSign}
              color="emerald"
            />
            <StatCard
              label="Lucro líquido (mês)"
              value={formatBRL(resumo.lucroLiquidoMes)}
              icon={PiggyBank}
              color="indigo"
            />
            <StatCard
              label="Ticket médio"
              value={formatBRL(resumo.ticketMedio)}
              icon={ShoppingBag}
              color="amber"
            />
            <StatCard
              label="Status DAS"
              value={resumo.statusDas?.status ?? '—'}
              hint={resumo.statusDas ? `Competência ${resumo.statusDas.competencia}` : 'Nenhuma guia gerada'}
              icon={Receipt}
              color={resumo.statusDas?.status === 'PAGO' ? 'emerald' : resumo.statusDas?.status === 'VENCIDO' ? 'red' : 'violet'}
            />
          </div>
        )
      )}

      {termometro && (
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm font-medium text-slate-500">Termômetro do teto MEI</p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all ${termometro.percentual >= 90 ? 'bg-red-500' : termometro.percentual >= 70 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
              style={{ width: `${Math.min(termometro.percentual, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {formatBRL(termometro.faturamentoAcumulado)} de {formatBRL(termometro.tetoProporcional)} (
            {termometro.percentual}%)
          </p>
          {termometro.alerta && (
            <div className="mt-2">
              <Badge variant="warning">Atenção: já atingiu {termometro.alerta} do teto proporcional</Badge>
            </div>
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
