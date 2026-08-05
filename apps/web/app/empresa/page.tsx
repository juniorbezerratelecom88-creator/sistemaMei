'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import type { AtividadeMei, Empresa } from '@sistema-mei/shared-types';
import { Building2, Image as ImageIcon, Palette, Plus, Users as UsersIcon } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { PageHeader } from '../../components/PageHeader';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { apiFetch, getTokens } from '../../lib/api-client';
import { applyBrandTheme } from '../../lib/apply-brand-theme';
import { decodeJwtPayload } from '../../lib/jwt';
import { usePageTitle } from '../../lib/use-page-title';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type RoleName = 'OWNER' | 'ADMIN' | 'OPERADOR';

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  isTwoFactorEnabled: boolean;
  createdAt: string;
}

export default function EmpresaPage() {
  usePageTitle('Empresa');
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [podeEditar, setPodeEditar] = useState(false);

  // --- criação (quando ainda não existe empresa) ---
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [atividade, setAtividade] = useState<AtividadeMei>('COMERCIO' as AtividadeMei);
  const [dataAbertura, setDataAbertura] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // --- edição dos dados cadastrais ---
  const [editCnpj, setEditCnpj] = useState('');
  const [editRazaoSocial, setEditRazaoSocial] = useState('');
  const [editAtividade, setEditAtividade] = useState<AtividadeMei>('COMERCIO' as AtividadeMei);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [dadosError, setDadosError] = useState<string | null>(null);
  const [dadosMessage, setDadosMessage] = useState<string | null>(null);

  // --- logo ---
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  // --- cores ---
  const [corPrimaria, setCorPrimaria] = useState('#4f46e5');
  const [corSecundaria, setCorSecundaria] = useState('#7c3aed');
  const [salvandoCores, setSalvandoCores] = useState(false);
  const [coresError, setCoresError] = useState<string | null>(null);
  const [coresMessage, setCoresMessage] = useState<string | null>(null);

  // --- usuários ---
  const [meuPapel, setMeuPapel] = useState<RoleName | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(true);
  const [usuariosError, setUsuariosError] = useState<string | null>(null);
  const [novoUsuarioOpen, setNovoUsuarioOpen] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({ name: '', email: '', password: '', role: 'OPERADOR' as RoleName });
  const [criandoUsuario, setCriandoUsuario] = useState(false);
  const [novoUsuarioError, setNovoUsuarioError] = useState<string | null>(null);

  useEffect(() => {
    const { accessToken } = getTokens();
    const payload = accessToken ? decodeJwtPayload(accessToken) : null;
    const role = (payload?.role as RoleName | undefined) ?? null;
    setMeuPapel(role);
    setPodeEditar(role === 'OWNER' || role === 'ADMIN');

    apiFetch<Empresa>('/empresas/atual')
      .then((data) => {
        setEmpresa(data);
        setEditCnpj(data.cnpj);
        setEditRazaoSocial(data.razaoSocial);
        setEditAtividade(data.atividade);
        setCorPrimaria(data.corPrimaria || '#4f46e5');
        setCorSecundaria(data.corSecundaria || '#7c3aed');
      })
      .catch(() => setEmpresa(null))
      .finally(() => setLoading(false));

    if (role === 'OWNER' || role === 'ADMIN') {
      apiFetch<Usuario[]>('/users')
        .then(setUsuarios)
        .catch((err) => setUsuariosError(err instanceof Error ? err.message : 'Erro ao carregar usuários.'))
        .finally(() => setUsuariosLoading(false));
    } else {
      setUsuariosLoading(false);
    }
  }, []);

  async function carregarUsuarios() {
    setUsuarios(await apiFetch<Usuario[]>('/users'));
  }

  async function handleCriarUsuario() {
    setNovoUsuarioError(null);
    setCriandoUsuario(true);
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(novoUsuario),
      });
      setNovoUsuarioOpen(false);
      setNovoUsuario({ name: '', email: '', password: '', role: 'OPERADOR' });
      await carregarUsuarios();
    } catch (err) {
      setNovoUsuarioError(err instanceof Error ? err.message : 'Erro ao criar usuário.');
    } finally {
      setCriandoUsuario(false);
    }
  }

  async function handleTrocarPapel(userId: string, role: RoleName) {
    setUsuariosError(null);
    try {
      await apiFetch(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      await carregarUsuarios();
    } catch (err) {
      setUsuariosError(err instanceof Error ? err.message : 'Erro ao trocar o papel.');
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSalvando(true);
    try {
      const nova = await apiFetch<Empresa>('/empresas', {
        method: 'POST',
        body: JSON.stringify({ cnpj, razaoSocial, atividade, dataAbertura }),
      });
      setEmpresa(nova);
      setMessage('Empresa criada. Faça login novamente para atualizar suas permissões.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empresa.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleSalvarDados(event: FormEvent) {
    event.preventDefault();
    setDadosError(null);
    setDadosMessage(null);
    setSalvandoDados(true);
    try {
      const atualizada = await apiFetch<Empresa>('/empresas/atual', {
        method: 'PATCH',
        body: JSON.stringify({ cnpj: editCnpj, razaoSocial: editRazaoSocial, atividade: editAtividade }),
      });
      setEmpresa(atualizada);
      setDadosMessage('Dados atualizados com sucesso.');
    } catch (err) {
      setDadosError(err instanceof Error ? err.message : 'Erro ao salvar os dados.');
    } finally {
      setSalvandoDados(false);
    }
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleEnviarLogo() {
    if (!logoFile) return;
    setLogoError(null);
    setEnviandoLogo(true);
    try {
      const { accessToken } = getTokens();
      const formData = new FormData();
      formData.append('logo', logoFile);
      const response = await fetch(`${API_URL}/empresas/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: 'Erro ao enviar a logo.' }));
        throw new Error(body.message ?? 'Erro ao enviar a logo.');
      }
      const atualizada = (await response.json()) as Empresa;
      setEmpresa(atualizada);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Erro ao enviar a logo.');
    } finally {
      setEnviandoLogo(false);
    }
  }

  async function handleSalvarCores() {
    setCoresError(null);
    setCoresMessage(null);
    setSalvandoCores(true);
    try {
      const atualizada = await apiFetch<Empresa>('/empresas/atual', {
        method: 'PATCH',
        body: JSON.stringify({ corPrimaria, corSecundaria }),
      });
      setEmpresa(atualizada);
      applyBrandTheme(atualizada);
      setCoresMessage('Cores atualizadas — o painel já foi atualizado.');
    } catch (err) {
      setCoresError(err instanceof Error ? err.message : 'Erro ao salvar as cores.');
    } finally {
      setSalvandoCores(false);
    }
  }

  return (
    <AppShell>
      <PageHeader title="Empresa" description="Dados cadastrais, logo e identidade visual do seu MEI" icon={Building2} color="teal" />

      {loading ? (
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="mb-4 h-5 w-48" />
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-5 w-36" />
        </div>
      ) : empresa ? (
        <>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {podeEditar ? (
            <form onSubmit={handleSalvarDados} className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-medium text-slate-500">Dados cadastrais</p>
              {dadosError && <Alert variant="error" onDismiss={() => setDadosError(null)}>{dadosError}</Alert>}
              {dadosMessage && (
                <Alert variant="success" onDismiss={() => setDadosMessage(null)} autoDismiss={4000}>
                  {dadosMessage}
                </Alert>
              )}

              <label className="mb-1 block text-sm font-medium">Razão social</label>
              <input
                required
                value={editRazaoSocial}
                onChange={(e) => setEditRazaoSocial(e.target.value)}
                className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />

              <label className="mb-1 block text-sm font-medium">CNPJ</label>
              <input
                required
                value={editCnpj}
                onChange={(e) => setEditCnpj(e.target.value)}
                placeholder="Somente números"
                className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />

              <label className="mb-1 block text-sm font-medium">Atividade</label>
              <select
                value={editAtividade}
                onChange={(e) => setEditAtividade(e.target.value as AtividadeMei)}
                className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="COMERCIO">Comércio</option>
                <option value="INDUSTRIA">Indústria</option>
                <option value="SERVICOS">Serviços</option>
              </select>

              <label className="mb-1 block text-sm font-medium">Data de abertura</label>
              <p className="mb-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {new Date(empresa.dataAbertura).toLocaleDateString('pt-BR')}
              </p>

              <Button type="submit" loading={salvandoDados} fullWidth>
                Salvar alterações
              </Button>
            </form>
          ) : (
            <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Razão social</p>
              <p className="mb-3 text-lg font-medium">{empresa.razaoSocial}</p>
              <p className="text-sm text-slate-500">CNPJ</p>
              <p className="mb-3 text-lg font-medium">{empresa.cnpj}</p>
              <p className="text-sm text-slate-500">Atividade</p>
              <p className="text-lg font-medium">{empresa.atividade}</p>
            </div>
          )}

          {podeEditar && (
            <div className="flex flex-col gap-6">
              <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                  <ImageIcon className="h-4 w-4" /> Logo da empresa
                </p>
                {logoError && <Alert variant="error" onDismiss={() => setLogoError(null)}>{logoError}</Alert>}

                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {logoPreview || empresa.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview ?? empresa.logoUrl ?? undefined}
                        alt="Logo da empresa"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoChange}
                    className="flex-1 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>

                <Button onClick={handleEnviarLogo} disabled={!logoFile} loading={enviandoLogo} fullWidth>
                  Enviar logo
                </Button>
                <p className="mt-2 text-xs text-slate-400">PNG, JPEG, WEBP ou SVG, até 2MB.</p>
              </div>

              <div className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Palette className="h-4 w-4" /> Cores do sistema
                </p>
                {coresError && <Alert variant="error" onDismiss={() => setCoresError(null)}>{coresError}</Alert>}
                {coresMessage && (
                  <Alert variant="success" onDismiss={() => setCoresMessage(null)} autoDismiss={4000}>
                    {coresMessage}
                  </Alert>
                )}

                <div className="mb-4 flex items-center gap-6">
                  <label className="flex flex-col items-center gap-1 text-xs text-slate-500">
                    Primária
                    <input
                      type="color"
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border border-slate-200"
                    />
                  </label>
                  <label className="flex flex-col items-center gap-1 text-xs text-slate-500">
                    Secundária
                    <input
                      type="color"
                      value={corSecundaria}
                      onChange={(e) => setCorSecundaria(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border border-slate-200"
                    />
                  </label>
                  <div
                    className="h-10 flex-1 rounded-md"
                    style={{ backgroundImage: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})` }}
                    title="Pré-visualização"
                  />
                </div>

                <Button onClick={handleSalvarCores} loading={salvandoCores} fullWidth>
                  Salvar cores
                </Button>
              </div>
            </div>
          )}
        </div>

        {podeEditar && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <UsersIcon className="h-4 w-4" /> Usuários com acesso ao sistema
              </p>
              <Button icon={<Plus className="h-4 w-4" />} onClick={() => setNovoUsuarioOpen(true)}>
                Novo usuário
              </Button>
            </div>

            {usuariosError && (
              <Alert variant="error" onDismiss={() => setUsuariosError(null)}>
                {usuariosError}
              </Alert>
            )}

            {usuariosLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Nome</th>
                      <th className="px-4 py-2">E-mail</th>
                      <th className="px-4 py-2">Papel</th>
                      <th className="px-4 py-2">2FA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id}>
                        <td className="px-4 py-2">{usuario.name}</td>
                        <td className="px-4 py-2">{usuario.email}</td>
                        <td className="px-4 py-2">
                          <select
                            value={usuario.role}
                            onChange={(e) => handleTrocarPapel(usuario.id, e.target.value as RoleName)}
                            disabled={usuario.role === 'OWNER' && meuPapel !== 'OWNER'}
                            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                          >
                            {meuPapel === 'OWNER' && <option value="OWNER">OWNER</option>}
                            <option value="ADMIN">ADMIN</option>
                            <option value="OPERADOR">OPERADOR</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={usuario.isTwoFactorEnabled ? 'success' : 'neutral'}>
                            {usuario.isTwoFactorEnabled ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {usuarios.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                          Nenhum usuário encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        </>
      ) : (
        <form onSubmit={handleCreate} className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm text-slate-500">
            Cadastre os dados do seu MEI para começar a usar o sistema.
          </p>
          {error && <Alert variant="error">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <label className="mb-1 block text-sm font-medium">CNPJ</label>
          <input
            required
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="Somente números"
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />

          <label className="mb-1 block text-sm font-medium">Razão social</label>
          <input
            required
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />

          <label className="mb-1 block text-sm font-medium">Atividade</label>
          <select
            value={atividade}
            onChange={(e) => setAtividade(e.target.value as AtividadeMei)}
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="COMERCIO">Comércio</option>
            <option value="INDUSTRIA">Indústria</option>
            <option value="SERVICOS">Serviços</option>
          </select>

          <label className="mb-1 block text-sm font-medium">Data de abertura</label>
          <input
            type="date"
            required
            value={dataAbertura}
            onChange={(e) => setDataAbertura(e.target.value)}
            className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <Button type="submit" loading={salvando} fullWidth>
            Cadastrar empresa
          </Button>
        </form>
      )}

      <ConfirmDialog
        open={novoUsuarioOpen}
        title="Novo usuário"
        description="A pessoa poderá entrar com este e-mail e senha imediatamente. Compartilhe as credenciais por um canal seguro."
        confirmLabel="Criar usuário"
        loading={criandoUsuario}
        onCancel={() => setNovoUsuarioOpen(false)}
        onConfirm={handleCriarUsuario}
      >
        <div className="space-y-3">
          {novoUsuarioError && <Alert variant="error">{novoUsuarioError}</Alert>}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
            <input
              required
              value={novoUsuario.name}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, name: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              required
              type="email"
              value={novoUsuario.email}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Senha inicial</label>
            <input
              required
              type="text"
              value={novoUsuario.password}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, password: e.target.value })}
              placeholder="Mín. 10 caracteres, com letra maiúscula, número e símbolo"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Papel</label>
            <select
              value={novoUsuario.role}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, role: e.target.value as RoleName })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {meuPapel === 'OWNER' && <option value="OWNER">OWNER</option>}
              <option value="ADMIN">ADMIN</option>
              <option value="OPERADOR">OPERADOR</option>
            </select>
          </div>
        </div>
      </ConfirmDialog>
    </AppShell>
  );
}
