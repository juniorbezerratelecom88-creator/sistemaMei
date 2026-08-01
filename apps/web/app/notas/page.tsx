'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { apiFetch } from '../../lib/api-client';

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

export default function NotasPage() {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<NotaFiscal[]>('/nfe')
      .then(setNotas)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar notas.'));
  }, []);

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Notas Fiscais</h1>

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <p className="mb-4 text-sm text-slate-500">
        A emissão de notas é feita a partir de uma venda concluída no PDV.
      </p>

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
              <tr key={nota.id}>
                <td className="px-4 py-3">{nota.tipo}</td>
                <td className="px-4 py-3">
                  {nota.numero}/{nota.serie}
                </td>
                <td className="px-4 py-3">
                  {Number(nota.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-4 py-3">{nota.status}</td>
                <td className="px-4 py-3">
                  {nota.pdfUrl && (
                    <a href={nota.pdfUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                      Abrir
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {notas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Nenhuma nota emitida ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
