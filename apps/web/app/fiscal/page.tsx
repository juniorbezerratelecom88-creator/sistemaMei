'use client';

import { useEffect, useState } from 'react';
import type { DasGuia } from '@sistema-mei/shared-types';
import { FileClock, Receipt } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { PageHeader } from '../../components/PageHeader';
import { Alert } from '../../components/ui/Alert';
import { Badge, type BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { apiFetch } from '../../lib/api-client';
import { usePageTitle } from '../../lib/use-page-title';

function formatBRL(value: string | number) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  PAGO: 'success',
  VENCIDO: 'danger',
  PENDENTE: 'warning',
};

export default function FiscalPage() {
  usePageTitle('Fiscal — DAS');
  const [guias, setGuias] = useState<DasGuia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [baixandoId, setBaixandoId] = useState<string | null>(null);

  async function carregar() {
    setGuias(await apiFetch<DasGuia[]>('/fiscal/das'));
  }

  useEffect(() => {
    carregar()
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar DAS.'))
      .finally(() => setLoading(false));
  }, []);

  async function gerarGuia() {
    setError(null);
    setGerando(true);
    try {
      await apiFetch('/fiscal/das/gerar', { method: 'POST', body: JSON.stringify({}) });
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar guia.');
    } finally {
      setGerando(false);
    }
  }

  async function darBaixa(id: string) {
    setError(null);
    setBaixandoId(id);
    try {
      await apiFetch(`/fiscal/das/${id}/baixa`, { method: 'POST' });
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao dar baixa.');
    } finally {
      setBaixandoId(null);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Fiscal — DAS"
        description="Guias mensais do Simples Nacional (MEI)"
        icon={Receipt}
        color="amber"
        actions={
          <Button onClick={gerarGuia} loading={gerando}>
            Gerar guia do mês
          </Button>
        }
      />

      {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <TableSkeleton rows={3} cols={5} />
      ) : guias.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white">
          <EmptyState
            icon={FileClock}
            title="Nenhuma guia gerada ainda"
            description='Clique em "Gerar guia do mês" para emitir o DAS da competência atual.'
          />
        </div>
      ) : (
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
                <tr key={guia.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">{guia.competencia}</td>
                  <td className="px-4 py-3">{formatBRL(guia.valor)}</td>
                  <td className="px-4 py-3">{new Date(guia.vencimento).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[guia.status] ?? 'neutral'}>{guia.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {guia.status !== 'PAGO' && (
                      <Button
                        variant="ghost"
                        className="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                        loading={baixandoId === guia.id}
                        onClick={() => darBaixa(guia.id)}
                      >
                        Registrar pagamento
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
