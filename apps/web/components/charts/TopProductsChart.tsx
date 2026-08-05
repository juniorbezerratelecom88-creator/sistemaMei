'use client';

import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Package } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { ChartTooltip } from './ChartTooltip';
import { CHART_COLORS } from '../../lib/chart-colors';

export interface ProdutoVendido {
  produtoId: string;
  nome: string;
  quantidadeVendida: number;
  totalVendido: number;
}

function formatBRL(value: number | string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCompactBRL(value: number) {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return `R$ ${value.toFixed(0)}`;
}

export function TopProductsChart({ produtos }: { produtos: ProdutoVendido[] }) {
  if (produtos.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhuma venda no período"
        description="Os produtos mais vendidos do mês aparecem aqui."
      />
    );
  }

  const altura = Math.max(produtos.length * 44, 120);

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart
        data={produtos}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 8, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="nome"
          tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
          content={<ChartTooltip formatter={(value) => formatBRL(value)} />}
        />
        <Bar dataKey="totalVendido" name="Total vendido" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="totalVendido"
            position="right"
            formatter={(value?: ReactNode) => (typeof value === 'number' ? formatCompactBRL(value) : '')}
            style={{ fill: '#0f172a', fontSize: 12, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
