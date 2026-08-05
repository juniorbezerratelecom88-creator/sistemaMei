'use client';

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { ChartTooltip } from './ChartTooltip';
import { CHART_COLORS } from '../../lib/chart-colors';

export interface DiaFluxoCaixa {
  data: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

function formatBRL(value: number | string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDiaLabel(iso: string) {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

export function CashFlowChart({ dias }: { dias: DiaFluxoCaixa[] }) {
  if (dias.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Sem movimentações no período"
        description="Vendas e contas pagas do mês aparecem aqui assim que forem registradas."
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS.positive }} />
          Saldo positivo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS.negative }} />
          Saldo negativo
        </span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={dias} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="data"
            tickFormatter={formatDiaLabel}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            axisLine={{ stroke: CHART_COLORS.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
          />
          <ReferenceLine y={0} stroke={CHART_COLORS.axis} />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
            content={
              <ChartTooltip
                formatter={(value) => formatBRL(value)}
                labelFormatter={(label) => `Dia ${formatDiaLabel(label)}`}
              />
            }
          />
          <Bar dataKey="saldo" name="Saldo do dia" radius={[4, 4, 4, 4]} maxBarSize={24}>
            {dias.map((dia) => (
              <Cell key={dia.data} fill={dia.saldo >= 0 ? CHART_COLORS.positive : CHART_COLORS.negative} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
