'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { PageHeader } from '../../components/PageHeader';
import { Alert } from '../../components/ui/Alert';
import { Badge, type BadgeVariant } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { apiFetch, getTokens } from '../../lib/api-client';
import { decodeJwtPayload } from '../../lib/jwt';
import { usePageTitle } from '../../lib/use-page-title';

interface AuditLogEntry {
  id: string;
  email: string;
  evento: 'LOGIN_SUCESSO' | 'LOGIN_2FA_SUCESSO' | 'LOGIN_FALHA';
  ip: string;
  dispositivo: string;
  cidade: string | null;
  pais: string | null;
  createdAt: string;
}

const EVENTO_LABEL: Record<AuditLogEntry['evento'], string> = {
  LOGIN_SUCESSO: 'Login',
  LOGIN_2FA_SUCESSO: 'Login (2FA)',
  LOGIN_FALHA: 'Falha de login',
};

const EVENTO_VARIANT: Record<AuditLogEntry['evento'], BadgeVariant> = {
  LOGIN_SUCESSO: 'success',
  LOGIN_2FA_SUCESSO: 'success',
  LOGIN_FALHA: 'danger',
};

export default function AuditoriaPage() {
  usePageTitle('Auditoria');
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const { accessToken } = getTokens();
    const payload = accessToken ? decodeJwtPayload(accessToken) : null;
    const podeVer = payload?.role === 'OWNER' || payload?.role === 'ADMIN';
    setAutorizado(podeVer);

    if (!podeVer) {
      setLoading(false);
      return;
    }

    apiFetch<AuditLogEntry[]>('/auditoria/logins')
      .then(setLogs)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar auditoria.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Auditoria"
        description="Logins realizados no sistema: quem, quando, de onde"
        icon={ShieldCheck}
        color="slate"
      />

      {!autorizado && !loading ? (
        <Alert variant="info">Esta tela é restrita aos papéis OWNER e ADMIN.</Alert>
      ) : (
        <>
          {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}

          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : logs.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white">
              <EmptyState
                icon={ShieldAlert}
                title="Nenhum registro de login ainda"
                description="Cada login (ou tentativa com credenciais inválidas) aparece aqui."
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Data/hora</th>
                    <th className="px-4 py-3">Usuário</th>
                    <th className="px-4 py-3">Evento</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">Dispositivo</th>
                    <th className="px-4 py-3">Localização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">{log.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={EVENTO_VARIANT[log.evento]}>{EVENTO_LABEL[log.evento]}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{log.ip}</td>
                      <td className="px-4 py-3">{log.dispositivo}</td>
                      <td className="px-4 py-3">
                        {log.cidade ? `${log.cidade}${log.pais ? ` · ${log.pais}` : ''}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
