# Sistema MEI

Plataforma de gestão fiscal, PDV, financeira e de faturamento para o Microempreendedor Individual (MEI).

Este repositório é um **scaffold funcional**: autenticação, RBAC, modelagem de dados e um fluxo de ponta a ponta por módulo já funcionam de verdade. As integrações externas reais (Gov.br/SIMEI, gateway de NF-e, Open Finance, WhatsApp) estão implementadas como **interfaces + adapters mockados**, prontas para receber credenciais/contratos reais sem precisar redesenhar nada — ver seção [Integrações externas](#integrações-externas-trocando-os-mocks-por-implementações-reais).

## Stack

- **Backend**: NestJS + TypeScript, Prisma ORM, PostgreSQL, Redis, BullMQ
- **Frontend**: Next.js (App Router) + TypeScript, Tailwind CSS
- **Monorepo**: npm workspaces (`apps/api`, `apps/web`, `packages/shared-types`)
- **Segurança**: Helmet + CSP/HSTS, CORS restrito, rate limiting (`@nestjs/throttler`), validação estrita de DTOs, senhas com Argon2id, JWT de acesso curto + refresh token rotacionado, 2FA (TOTP) para contas críticas, AES-256-GCM para campos sensíveis (tokens de terceiros, segredo 2FA, certificado A1)

## Estrutura

```
apps/api          # NestJS - API REST
apps/web           # Next.js - painel web
packages/shared-types  # tipos/enums compartilhados entre api e web
docker-compose.yml # Postgres + Redis + api + web
```

## Pré-requisitos

- Node.js 20+
- Docker + Docker Compose (para Postgres e Redis locais)

## Como rodar localmente (Windows — atalho)

Dê duplo clique em **`Iniciar Sistema MEI.lnk`** (ou em `iniciar-sistema.bat`) na raiz do projeto. O script:

1. verifica se o Docker está instalado;
2. cria o `.env` a partir do `.env.example` na primeira execução;
3. instala as dependências (`npm install`) se necessário;
4. sobe Postgres e Redis via Docker Compose;
5. gera o Prisma Client e aplica as migrations;
6. abre a API e o painel web cada um em sua própria janela do terminal;
7. abre `http://localhost:3000` no navegador.

Pré-requisito: Docker Desktop instalado e em execução. Para parar o sistema, feche as janelas "Sistema MEI - API" e "Sistema MEI - Web" (os containers do Postgres/Redis continuam rodando em segundo plano — pare-os com `docker compose down`, se quiser).

## Como rodar localmente (manual)

```bash
# 1. instalar dependências
npm install

# 2. copiar variáveis de ambiente
cp .env.example .env
# gere uma chave de criptografia real e cole em ENCRYPTION_KEY:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. subir Postgres e Redis
docker compose up -d postgres redis

# 4. rodar as migrations e o seed
npm run prisma:migrate --workspace=apps/api
npm run prisma:seed --workspace=apps/api

# 5. subir a API (http://localhost:3001, docs em /docs)
npm run dev:api

# 6. em outro terminal, subir o painel web (http://localhost:3000)
npm run dev:web
```

Login de teste (criado pelo seed): `admin@sistemamei.com.br` / `Senha@Forte123`.

Alternativamente, `docker compose up -d` sobe tudo (Postgres, Redis, API e Web) em containers.

## Verificação ponta a ponta

1. Acesse `http://localhost:3000`, faça login com o usuário do seed.
2. Em **Empresa**, confirme os dados do MEI de exemplo (já criado pelo seed).
3. Em **PDV**, abra o caixa, clique em um produto para adicionar ao carrinho e finalize a venda.
4. Em **Notas Fiscais** (ou via Swagger `POST /nfe/vendas/:vendaId/emitir`), emita a nota da venda — o adapter mock gera XML/PDF fictícios instantaneamente.
5. Em **Fiscal**, clique em "Gerar guia do mês" e depois em "Registrar pagamento" para simular a baixa do DAS.
6. Em **Financeiro**, cadastre uma conta a pagar/receber e marque como paga/recebida; confira o fluxo de caixa projetado.
7. Volte ao **Dashboard** e confira o faturamento, lucro líquido, ticket médio e termômetro do teto MEI recalculados.

### Testes automatizados

```bash
npm run test:api       # unitários (auth, cálculo do teto MEI, criptografia)
npm run test:e2e:api   # fluxo completo: registro -> empresa -> PDV -> emissão de nota
```

O teste e2e precisa de Postgres e Redis rodando (`docker compose up -d postgres redis`) e das migrations aplicadas.

## Integrações externas: trocando os mocks por implementações reais

Cada integração tem uma **interface** e um **adapter mock** injetado via token do NestJS. Para ativar a integração real, basta criar um novo adapter que implemente a mesma interface e trocar o `useClass` no módulo correspondente — nenhum outro código precisa mudar.

| Integração | Interface | Adapter mock | Módulo (trocar o provider) |
|---|---|---|---|
| Gov.br / SIMEI (DAS) | `GovBrGateway` (`apps/api/src/modules/fiscal/gov-br-gateway.interface.ts`) | `SimeiGatewayMockAdapter` | `fiscal.module.ts` |
| Gateway de NF-e | `NfeGateway` (`apps/api/src/modules/nfe/nfe-gateway.interface.ts`) | `NfeGatewayMockAdapter` | `nfe.module.ts` |
| Open Finance (conciliação bancária) | `BankGateway` (`apps/api/src/modules/financeiro/bank-gateway.interface.ts`) | `OpenFinanceMockAdapter` | `financeiro.module.ts` |
| E-mail / WhatsApp / Push | `Notifier` (`apps/api/src/modules/notifications/notifier.interface.ts`) | `*NotifierMockAdapter` | `notifications.module.ts` |

As variáveis de ambiente para cada provedor já estão documentadas em [.env.example](.env.example) (`GOVBR_*`, `NFE_GATEWAY_*`, `OPEN_FINANCE_*`, `WHATSAPP_*`, `SMTP_*`).

O certificado digital A1 (`.pfx`) é armazenado cifrado (AES-256-GCM) no banco via o modelo `Certificado`; em produção, substitua a chave de criptografia estática por um Vault/KMS dedicado (ver comentário em `common/crypto/crypto.service.ts`).

## Segurança

- Rate limiting global + limite mais agressivo em `/auth/login` e `/auth/2fa/login-verify`
- Todas as rotas de negócio exigem JWT válido (`JwtAuthGuard`); RBAC por papel (`OWNER`/`ADMIN`/`OPERADOR`) via `RolesGuard` + `@Roles()`
- `TwoFactorGuard` disponível para proteger ações críticas exigindo 2FA habilitado na conta
- Segredos de API, tokens Open Finance e segredo TOTP nunca ficam em texto plano no banco (AES-256-GCM)
- Swagger (`/docs`) fica desabilitado quando `NODE_ENV=production`

## Limitações conhecidas deste scaffold

- Integrações externas são mocks (ver tabela acima) — nenhuma chamada real é feita a Gov.br, gateways de NF-e, Open Finance ou WhatsApp.
- App mobile (React Native/Flutter) não está incluído nesta fase — apenas o painel web.
- Cobertura de testes cobre os fluxos críticos (auth, cálculo do teto MEI, e2e do PDV) e não os 80% sugeridos na especificação original.
- Este ambiente de desenvolvimento não possui Docker/Postgres/Redis instalados; a suíte completa (`docker compose up`, migrations, e2e) deve ser validada na sua máquina/CI seguindo os passos acima.
