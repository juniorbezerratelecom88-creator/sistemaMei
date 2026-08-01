'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { PageHeader } from '../../components/PageHeader';
import { Alert } from '../../components/ui/Alert';
import { Badge, type BadgeVariant } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { apiFetch } from '../../lib/api-client';
import { usePageTitle } from '../../lib/use-page-title';

interface NotaFiscal {
  id: string;
  tipo: string;
  numero: string;
  serie: string;
  status: string;
  valorTotal: string;
  pdfUrl: string | null;
  createdAt: string;
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  AUTORIZADA: 'success',
  CANCELADA: 'neutral',
  ERRO: 'danger',
  PROCESSANDO: 'info',
};

export default function NotasPage() {
  usePageTitle('Notas Fiscais');
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<NotaFiscal[]>('/nfe')
      .then(setNotas)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar notas.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Notas Fiscais"
        description="Emitidas a partir de vendas concluídas no PDV"
        icon={FileText}
        color="violet"
      />

      {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <TableSkeleton rows={3} cols={5} />
      ) : notas.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white">
          <EmptyState
            icon={FileText}
            title="Nenhuma nota emitida ainda"
            description="A emissão de notas é feita a partir de uma venda concluída no PDV."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Número/Série</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notas.map((nota) => (
                <tr key={nota.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">{nota.tipo}</td>
                  <td className="px-4 py-3">
                    {nota.numero}/{nota.serie}
                  </td>
                  <td className="px-4 py-3">
                    {Number(nota.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[nota.status] ?? 'neutral'}>{nota.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {nota.pdfUrl && (
                      <a href={nota.pdfUrl} target="_blank" rel="noreferrer" className="font-medium text-violet-600 hover:underline">
                        Abrir
                      </a>
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
