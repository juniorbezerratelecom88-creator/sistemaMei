import { ReceiptText } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { CHART_COLORS } from '../../lib/chart-colors';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function RevenueSplitBar({
  receitaComNota,
  receitaSemNota,
}: {
  receitaComNota: number;
  receitaSemNota: number;
}) {
  const total = receitaComNota + receitaSemNota;

  if (total <= 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Nenhuma receita registrada no ano"
        description="A proporção entre vendas com e sem nota fiscal aparece aqui."
      />
    );
  }

  const pctComNota = (receitaComNota / total) * 100;
  const pctSemNota = (receitaSemNota / total) * 100;

  return (
    <div>
      <div className="flex h-6 w-full gap-1 overflow-hidden rounded-md">
        {pctComNota > 0 && (
          <div
            className="flex items-center justify-center rounded-md text-[11px] font-semibold text-white"
            style={{ width: `${pctComNota}%`, backgroundColor: CHART_COLORS.primary }}
            title={`Com nota: ${formatBRL(receitaComNota)}`}
          >
            {pctComNota >= 12 && `${pctComNota.toFixed(0)}%`}
          </div>
        )}
        {pctSemNota > 0 && (
          <div
            className="flex items-center justify-center rounded-md text-[11px] font-semibold text-white"
            style={{ width: `${pctSemNota}%`, backgroundColor: CHART_COLORS.secondary }}
            title={`Sem nota: ${formatBRL(receitaSemNota)}`}
          >
            {pctSemNota >= 12 && `${pctSemNota.toFixed(0)}%`}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
          <span className="text-slate-500">Com nota</span>
          <span className="font-semibold text-slate-900">{formatBRL(receitaComNota)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS.secondary }} />
          <span className="text-slate-500">Sem nota</span>
          <span className="font-semibold text-slate-900">{formatBRL(receitaSemNota)}</span>
        </span>
      </div>
    </div>
  );
}
