// Tipos compartilhados entre apps/api e apps/web.
// Mantidos em sincronia manualmente com apps/api/prisma/schema.prisma
// (não importamos o @prisma/client aqui para não acoplar o frontend ao Prisma).

export enum RoleName {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  OPERADOR = 'OPERADOR',
}

export enum AtividadeMei {
  COMERCIO = 'COMERCIO',
  INDUSTRIA = 'INDUSTRIA',
  SERVICOS = 'SERVICOS',
}

export enum DasStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  VENCIDO = 'VENCIDO',
}

export enum TipoNota {
  NFSE = 'NFSE',
  NFE = 'NFE',
  NFCE = 'NFCE',
}

export enum StatusNota {
  PROCESSANDO = 'PROCESSANDO',
  AUTORIZADA = 'AUTORIZADA',
  CANCELADA = 'CANCELADA',
  ERRO = 'ERRO',
}

export enum FormaPagamento {
  DINHEIRO = 'DINHEIRO',
  PIX = 'PIX',
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
}

export enum VendaStatus {
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export enum CaixaStatus {
  ABERTO = 'ABERTO',
  FECHADO = 'FECHADO',
}

export enum ContaPagarStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  ATRASADO = 'ATRASADO',
}

export enum ContaReceberStatus {
  PENDENTE = 'PENDENTE',
  RECEBIDO = 'RECEBIDO',
  ATRASADO = 'ATRASADO',
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends Partial<AuthTokens> {
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}

export interface Empresa {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  atividade: AtividadeMei;
  dataAbertura: string;
}

export interface Produto {
  id: string;
  nome: string;
  sku?: string | null;
  precoVenda: string;
  custoUnitario: string;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export interface DasGuia {
  id: string;
  competencia: string;
  valor: string;
  vencimento: string;
  status: DasStatus;
  pixCopiaECola?: string | null;
  qrCodeUrl?: string | null;
}

export interface TermometroFaturamento {
  ano: number;
  tetoAnualMei: number;
  tetoProporcional: number;
  faturamentoAcumulado: number;
  percentual: number;
  alerta: string | null;
  desenquadramentoIminente: boolean;
}

export interface DashboardResumo {
  faturamentoBrutoMes: number;
  lucroLiquidoMes: number;
  ticketMedio: number;
  quantidadeVendasMes: number;
  produtosMaisVendidos: {
    produtoId: string;
    nome: string;
    quantidadeVendida: number;
    totalVendido: number;
  }[];
  statusDas: { competencia: string; status: DasStatus; vencimento: string } | null;
}
