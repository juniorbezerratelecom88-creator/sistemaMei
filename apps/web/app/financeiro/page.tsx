'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Scale, Wallet } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Alert } from '../../components/ui/Alert';
import { Badge, type BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import { apiFetch } from '../../lib/api-client';
import { usePageTitle } from '../../lib/use-page-title';

interface Conta {
  id: string;
  descricao: string;
  categoria: string;
  valor: string;
  vencimento: string;
  status: string;
}

interface Projetado {
  entradasPrevistas: number;
  saidasPrevistas: number;
  saldoProjetado: number;
}

function formatBRL(value: string | number) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  PAGO: 'success',
  RECEBIDO: 'success',
  ATRASADO: 'danger',
  PENDENTE: 'warning',
};

export default function FinanceiroPage() {
  usePageTitle('Financeiro');
  const [contasPagar, setContasPagar] = useState<Conta[]>([]);
  const [contasReceber, setContasReceber] = useState<Conta[]>([]);
  const [projetado, setProjetado] = useState<Projetado | null>(null);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [tipo, setTipo] = useState<'pagar' | 'receber'>('receber');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [baixandoId, setBaixandoId] = useState<string | null>(null);

  async function carregar() {
    const [pagar, receber, fluxo] = await Promise.all([
      apiFetch<Conta[]>('/financeiro/contas-pagar'),
      apiFetch<Conta[]>('/financeiro/contas-receber'),
      apiFetch<Projetado>('/financeiro/fluxo-caixa/projetado'),
    ]);
    setContasPagar(pagar);
    setContasReceber(receber);
    setProjetado(fluxo);
  }

  useEffect(() => {
    carregar()
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar financeiro.'))
      .finally(() => setLoading(false));
  }, []);

  async function criarConta(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSalvando(true);
    try {
      const endpoint = tipo === 'pagar' ? '/financeiro/contas-pagar' : '/financeiro/contas-receber';
      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ descricao, categoria, valor: Number(valor), vencimento }),
      });
      setDescricao('');
      setCategoria('');
      setValor('');
      setVencimento('');
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setSalvando(false);
    }
  }

  async function baixarConta(id: string, contaTipo: 'pagar' | 'receber') {
    setBaixandoId(id);
    try {
      const endpoint =
        contaTipo === 'pagar' ? `/financeiro/contas-pagar/${id}/pagar` : `/financeiro/contas-receber/${id}/receber`;
      await apiFetch(endpoint, { method: 'POST' });
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar conta.');
    } finally {
      setBaixandoId(null);
    }
  }

  return (
    <AppShell>
      <PageHeader title="Financeiro" description="Contas a pagar, a receber e fluxo de caixa" icon={Wallet} color="sky" />

      {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        projetado && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Entradas previstas (30 dias)" value={formatBRL(projetado.entradasPrevistas)} icon={ArrowUpCircle} color="emerald" />
            <StatCard label="Saídas previstas (30 dias)" value={formatBRL(projetado.saidasPrevistas)} icon={ArrowDownCircle} color="red" />
            <StatCard label="Saldo projetado" value={formatBRL(projetado.saldoProjetado)} icon={Scale} color="sky" />
          </div>
        )
      )}

      <form
        onSubmit={criarConta}
        className="mb-8 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-6"
      >
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as 'pagar' | 'receber')}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-1"
        >
          <option value="receber">A receber</option>
          <option value="pagar">A pagar</option>
        </select>
        <input
          placeholder="Descrição"
          required
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          placeholder="Categoria"
          required
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-1"
        />
        <input
          type="number"
          placeholder="Valor"
          required
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-1"
        />
        <input
          type="date"
          required
          value={vencimento}
          onChange={(e) => setVencimento(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-1"
        />
        <Button type="submit" loading={salvando} className="sm:col-span-6">
          Adicionar
        </Button>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TableSkeleton rows={3} cols={2} />
          <TableSkeleton rows={3} cols={2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium text-slate-500">Contas a receber</p>
            {contasReceber.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white">
                <EmptyState icon={ArrowUpCircle} title="Nenhuma conta a receber" />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
                {contasReceber.map((conta) => (
                  <li key={conta.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{conta.descricao}</p>
                      <p className="text-xs text-slate-400">
                        {conta.categoria} · vence {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1">{formatBRL(conta.valor)}</p>
                      {conta.status !== 'RECEBIDO' ? (
                        <Button
                          variant="ghost"
                          className="px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
                          loading={baixandoId === conta.id}
                          onClick={() => baixarConta(conta.id, 'receber')}
                        >
                          Marcar como recebido
                        </Button>
                      ) : (
                        <Badge variant={STATUS_VARIANT[conta.status]}>Recebido</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-500">Contas a pagar</p>
            {contasPagar.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white">
                <EmptyState icon={ArrowDownCircle} title="Nenhuma conta a pagar" />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
                {contasPagar.map((conta) => (
                  <li key={conta.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{conta.descricao}</p>
                      <p className="text-xs text-slate-400">
                        {conta.categoria} · vence {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1">{formatBRL(conta.valor)}</p>
                      {conta.status !== 'PAGO' ? (
                        <Button
                          variant="ghost"
                          className="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                          loading={baixandoId === conta.id}
                          onClick={() => baixarConta(conta.id, 'pagar')}
                        >
                          Marcar como pago
                        </Button>
                      ) : (
                        <Badge variant={STATUS_VARIANT[conta.status]}>Pago</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
