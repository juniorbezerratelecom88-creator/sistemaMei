'use client';

import { useEffect, useState } from 'react';
import type { FormaPagamento, Produto } from '@sistema-mei/shared-types';
import { Lock, Package, Plus, ShoppingCart } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { PageHeader } from '../../components/PageHeader';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { apiFetch } from '../../lib/api-client';
import { usePageTitle } from '../../lib/use-page-title';

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
  usePageTitle('PDV');
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX' as FormaPagamento);
  const [valorAbertura, setValorAbertura] = useState('100');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [abrindoCaixa, setAbrindoCaixa] = useState(false);
  const [finalizandoVenda, setFinalizandoVenda] = useState(false);
  const [fecharCaixaOpen, setFecharCaixaOpen] = useState(false);
  const [valorFechamento, setValorFechamento] = useState('0');
  const [fechandoCaixa, setFechandoCaixa] = useState(false);
  const [novoProdutoOpen, setNovoProdutoOpen] = useState(false);
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    sku: '',
    precoVenda: '',
    custoUnitario: '',
    estoqueAtual: '',
    estoqueMinimo: '',
  });
  const [criandoProduto, setCriandoProduto] = useState(false);

  async function carregar() {
    const [caixaAtual, listaProdutos] = await Promise.all([
      apiFetch<Caixa | null>('/pdv/caixa/atual'),
      apiFetch<Produto[]>('/pdv/produtos'),
    ]);
    setCaixa(caixaAtual);
    setProdutos(listaProdutos);
  }

  useEffect(() => {
    carregar()
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar PDV.'))
      .finally(() => setLoading(false));
  }, []);

  async function abrirCaixa() {
    setError(null);
    setAbrindoCaixa(true);
    try {
      await apiFetch('/pdv/caixa/abrir', {
        method: 'POST',
        body: JSON.stringify({ valorAbertura: Number(valorAbertura) }),
      });
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao abrir caixa.');
    } finally {
      setAbrindoCaixa(false);
    }
  }

  async function confirmarFecharCaixa() {
    if (!caixa) return;
    setError(null);
    setFechandoCaixa(true);
    try {
      await apiFetch(`/pdv/caixa/${caixa.id}/fechar`, {
        method: 'POST',
        body: JSON.stringify({ valorFechamento: Number(valorFechamento) }),
      });
      setFecharCaixaOpen(false);
      setCarrinho([]);
      setMessage('Caixa fechado com sucesso.');
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fechar caixa.');
    } finally {
      setFechandoCaixa(false);
    }
  }

  async function criarProduto() {
    setError(null);
    setCriandoProduto(true);
    try {
      await apiFetch('/pdv/produtos', {
        method: 'POST',
        body: JSON.stringify({
          nome: novoProduto.nome,
          sku: novoProduto.sku || undefined,
          precoVenda: Number(novoProduto.precoVenda),
          custoUnitario: novoProduto.custoUnitario ? Number(novoProduto.custoUnitario) : undefined,
          estoqueAtual: novoProduto.estoqueAtual ? Number(novoProduto.estoqueAtual) : undefined,
          estoqueMinimo: novoProduto.estoqueMinimo ? Number(novoProduto.estoqueMinimo) : undefined,
        }),
      });
      setNovoProdutoOpen(false);
      setNovoProduto({ nome: '', sku: '', precoVenda: '', custoUnitario: '', estoqueAtual: '', estoqueMinimo: '' });
      setMessage('Produto cadastrado com sucesso.');
      await carregar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar produto.');
    } finally {
      setCriandoProduto(false);
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
    setFinalizandoVenda(true);
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
    } finally {
      setFinalizandoVenda(false);
    }
  }

  const caixaAberto = caixa && caixa.status === 'ABERTO';

  return (
    <AppShell>
      <PageHeader
        title="PDV"
        description="Frente de caixa"
        icon={ShoppingCart}
        color="emerald"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setNovoProdutoOpen(true)}
            >
              Novo produto
            </Button>
            {caixaAberto && (
              <Button
                variant="secondary"
                icon={<Lock className="h-4 w-4" />}
                onClick={() => {
                  setValorFechamento(String(Number(caixa!.valorAbertura) + total));
                  setFecharCaixaOpen(true);
                }}
              >
                Fechar caixa
              </Button>
            )}
          </div>
        }
      />

      {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}
      {message && (
        <Alert variant="success" onDismiss={() => setMessage(null)} autoDismiss={4000}>
          {message}
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : !caixaAberto ? (
        <div className="max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm text-slate-500">Nenhum caixa aberto. Informe o valor inicial:</p>
          <input
            type="number"
            value={valorAbertura}
            onChange={(e) => setValorAbertura(e.target.value)}
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Button onClick={abrirCaixa} loading={abrindoCaixa} fullWidth>
            Abrir caixa
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="mb-3 text-sm font-medium text-slate-500">Produtos</p>
            {produtos.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white">
                <EmptyState
                  icon={Package}
                  title="Nenhum produto cadastrado"
                  description="Cadastre seu primeiro produto para começar a vender."
                  action={
                    <Button icon={<Plus className="h-4 w-4" />} onClick={() => setNovoProdutoOpen(true)}>
                      Novo produto
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {produtos.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => adicionarAoCarrinho(produto)}
                    className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
                  >
                    <p className="text-sm font-medium">{produto.nome}</p>
                    <p className="text-xs text-emerald-600">
                      {Number(produto.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-xs text-slate-400">Estoque: {produto.estoqueAtual}</p>
                  </button>
                ))}
              </div>
            )}
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

              <Button
                disabled={carrinho.length === 0}
                loading={finalizandoVenda}
                onClick={finalizarVenda}
                fullWidth
              >
                Finalizar venda
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={fecharCaixaOpen}
        title="Fechar caixa"
        description="Confira o valor final em caixa antes de confirmar. Essa ação encerra o dia."
        confirmLabel="Fechar caixa"
        loading={fechandoCaixa}
        onCancel={() => setFecharCaixaOpen(false)}
        onConfirm={confirmarFecharCaixa}
      >
        <label className="mb-1 block text-sm font-medium text-slate-700">Valor de fechamento</label>
        <input
          type="number"
          value={valorFechamento}
          onChange={(e) => setValorFechamento(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={novoProdutoOpen}
        title="Novo produto"
        confirmLabel="Cadastrar"
        loading={criandoProduto}
        onCancel={() => setNovoProdutoOpen(false)}
        onConfirm={criarProduto}
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
            <input
              required
              value={novoProduto.nome}
              onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Preço de venda</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={novoProduto.precoVenda}
                onChange={(e) => setNovoProduto({ ...novoProduto, precoVenda: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Custo unitário</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={novoProduto.custoUnitario}
                onChange={(e) => setNovoProduto({ ...novoProduto, custoUnitario: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Estoque inicial</label>
              <input
                type="number"
                min="0"
                value={novoProduto.estoqueAtual}
                onChange={(e) => setNovoProduto({ ...novoProduto, estoqueAtual: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Estoque mínimo</label>
              <input
                type="number"
                min="0"
                value={novoProduto.estoqueMinimo}
                onChange={(e) => setNovoProduto({ ...novoProduto, estoqueMinimo: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">SKU (opcional)</label>
            <input
              value={novoProduto.sku}
              onChange={(e) => setNovoProduto({ ...novoProduto, sku: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </ConfirmDialog>
    </AppShell>
  );
}
