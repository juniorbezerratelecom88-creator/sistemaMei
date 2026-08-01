'use client';

import { useEffect, useState } from 'react';
import type { FormaPagamento, Produto } from '@sistema-mei/shared-types';
import { AppShell } from '../../components/AppShell';
import { apiFetch } from '../../lib/api-client';

interface Caixa {
  id: string;
  status: 'ABERTO' | 'FECHADO';
  valorAbertura: string;
}

interface ItemCarrinho {
  produtoId: string;
  nome: string;
  precoVenda: number;
  quantidade: number;
}

export default function PdvPage() {
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX' as FormaPagamento);
  const [valorAbertura, setValorAbertura] = useState('100');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    const [caixaAtual, listaProdutos] = await Promise.all([
      apiFetch<Caixa | null>('/pdv/caixa/atual'),
      apiFetch<Produto[]>('/pdv/produtos'),
    ]);
    setCaixa(caixaAtual);
    setProdutos(listaProdutos);
  }

  useEffect(() => {
    carregar().catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar PDV.'));
  }, []);

  async function abrirCaixa() {
    setError(null);
    try {
      await apiFetch('/pdv/caixa/abrir', {
        method: 'POST',
        body: JSON.stringify({ valorAbertura: Number(valorAbertura) }),
      });
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao abrir caixa.');
    }
  }

  function adicionarAoCarrinho(produto: Produto) {
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.produtoId === produto.id);
      if (existente) {
        return atual.map((item) =>
          item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item,
        );
      }
      return [
        ...atual,
        { produtoId: produto.id, nome: produto.nome, precoVenda: Number(produto.precoVenda), quantidade: 1 },
      ];
    });
  }

  const total = carrinho.reduce((acc, item) => acc + item.precoVenda * item.quantidade, 0);

  async function finalizarVenda() {
    setError(null);
    setMessage(null);
    try {
      await apiFetch('/pdv/vendas', {
        method: 'POST',
        body: JSON.stringify({
          itens: carrinho.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
          formaPagamento,
        }),
      });
      setCarrinho([]);
      setMessage('Venda registrada com sucesso.');
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar venda.');
    }
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">PDV</h1>

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

      {!caixa || caixa.status === 'FECHADO' ? (
        <div className="max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm text-slate-500">Nenhum caixa aberto. Informe o valor inicial:</p>
          <input
            type="number"
            value={valorAbertura}
            onChange={(e) => setValorAbertura(e.target.value)}
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={abrirCaixa}
            className="w-full rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Abrir caixa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="mb-3 text-sm font-medium text-slate-500">Produtos</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {produtos.map((produto) => (
                <button
                  key={produto.id}
                  onClick={() => adicionarAoCarrinho(produto)}
                  className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-brand-500"
                >
                  <p className="text-sm font-medium">{produto.nome}</p>
                  <p className="text-xs text-slate-500">
                    {Number(produto.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-xs text-slate-400">Estoque: {produto.estoqueAtual}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-500">Carrinho</p>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              {carrinho.length === 0 && <p className="text-sm text-slate-400">Nenhum item adicionado.</p>}
              <ul className="mb-3 divide-y divide-slate-100">
                {carrinho.map((item) => (
                  <li key={item.produtoId} className="flex justify-between py-2 text-sm">
                    <span>
                      {item.quantidade}x {item.nome}
                    </span>
                    <span>
                      {(item.precoVenda * item.quantidade).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mb-3 text-right text-sm font-semibold">
                Total: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>

              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
                className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="PIX">Pix</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="DEBITO">Débito</option>
                <option value="CREDITO">Crédito</option>
              </select>

              <button
                disabled={carrinho.length === 0}
                onClick={finalizarVenda}
                className="w-full rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Finalizar venda
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
