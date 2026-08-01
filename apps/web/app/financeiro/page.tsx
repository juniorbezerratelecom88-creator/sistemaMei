'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { apiFetch } from '../../lib/api-client';

interface Conta {
  id: string;
  descricao: string;
  categoria: string;
  valor: string;
  vencimento: string;
  status: string;
}

function formatBRL(value: string | number) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FinanceiroPage() {
  const [contasPagar, setContasPagar] = useState<Conta[]>([]);
  const [contasReceber, setContasReceber] = useState<Conta[]>([]);
  const [projetado, setProjetado] = useState<{ entradasPrevistas: number; saidasPrevistas: number; saldoProjetado: number } | null>(null);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [tipo, setTipo] = useState<'pagar' | 'receber'>('receber');
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    const [pagar, receber, fluxo] = await Promise.all([
      apiFetch<Conta[]>('/financeiro/contas-pagar'),
      apiFetch<Conta[]>('/financeiro/contas-receber'),
      apiFetch<{ entradasPrevistas: number; saidasPrevistas: number; saldoProjetado: number }>(
        '/financeiro/fluxo-caixa/projetado',
      ),
    ]);
    setContasPagar(pagar);
    setContasReceber(receber);
    setProjetado(fluxo);
  }

  useEffect(() => {
    carregar().catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar financeiro.'));
  }, []);

  async function criarConta(event: FormEvent) {
    event.preventDefault();
    setError(null);
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
    }
  }

  async function baixarConta(id: string, contaTipo: 'pagar' | 'receber') {
    const endpoint =
      contaTipo === 'pagar' ? `/financeiro/contas-pagar/${id}/pagar` : `/financeiro/contas-receber/${id}/receber`;
    await apiFetch(endpoint, { method: 'POST' });
    await carregar();
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Financeiro</h1>

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {projetado && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Entradas previstas (30 dias)</p>
            <p className="text-lg font-semibold text-emerald-600">{formatBRL(projetado.entradasPrevistas)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Saídas previstas (30 dias)</p>
            <p className="text-lg font-semibold text-red-600">{formatBRL(projetado.saidasPrevistas)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Saldo projetado</p>
            <p className="text-lg font-semibold">{formatBRL(projetado.saldoProjetado)}</p>
          </div>
        </div>
      )}

      <form onSubmit={criarConta} className="mb-8 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-6">
        <select value={tipo} onChange={(e) => setTipo(e.target.value as 'pagar' | 'receber')} className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-1">
          <option value="receber">A receber</option>
          <option value="pagar">A pagar</option>
        </select>
        <input placeholder="Descrição" required value={descricao} onChange={(e) => setDescricao(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
        <input placeholder="Categoria" required value={categoria} onChange={(e) => setCategoria(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-1" />
        <input type="number" placeholder="Valor" required value={valor} onChange={(e) => setValor(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-1" />
        <input type="date" required value={vencimento} onChange={(e) => setVencimento(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-1" />
        <button type="submit" className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:col-span-6">
          Adicionar
        </button>
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-slate-500">Contas a receber</p>
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
                  <p>{formatBRL(conta.valor)}</p>
                  {conta.status !== 'RECEBIDO' ? (
                    <button onClick={() => baixarConta(conta.id, 'receber')} className="text-xs text-brand-600 hover:underline">
                      Marcar como recebido
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600">Recebido</span>
                  )}
                </div>
              </li>
            ))}
            {contasReceber.length === 0 && <li className="px-4 py-6 text-center text-slate-400">Nenhuma conta.</li>}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-500">Contas a pagar</p>
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
                  <p>{formatBRL(conta.valor)}</p>
                  {conta.status !== 'PAGO' ? (
                    <button onClick={() => baixarConta(conta.id, 'pagar')} className="text-xs text-brand-600 hover:underline">
                      Marcar como pago
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600">Pago</span>
                  )}
                </div>
              </li>
            ))}
            {contasPagar.length === 0 && <li className="px-4 py-6 text-center text-slate-400">Nenhuma conta.</li>}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
