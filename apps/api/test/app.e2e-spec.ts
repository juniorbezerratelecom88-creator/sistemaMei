import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Testa o fluxo de ponta a ponta: registro -> criação de empresa -> login ->
 * abertura de caixa -> cadastro de produto -> venda -> emissão de nota mock.
 *
 * Requer Postgres e Redis rodando (ver docker-compose.yml) e
 * `npm run prisma:migrate --workspace=apps/api` executado previamente.
 */
describe('Fluxo PDV -> NF-e (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const email = `teste.e2e.${Date.now()}@sistemamei.com.br`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registra o usuário e loga', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, name: 'Usuário E2E', password: 'Senha@Forte123' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Senha@Forte123' })
      .expect(200);

    accessToken = login.body.accessToken;
    expect(accessToken).toBeDefined();
  });

  it('cria a empresa e vincula ao usuário', async () => {
    await request(app.getHttpServer())
      .post('/empresas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        cnpj: String(Date.now()).padStart(14, '0'),
        razaoSocial: 'Empresa E2E LTDA',
        atividade: 'COMERCIO',
        dataAbertura: '2024-01-01',
      })
      .expect(201);

    // Reautentica para obter um token com o empresaId atualizado.
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Senha@Forte123' })
      .expect(200);
    accessToken = login.body.accessToken;
  });

  it('abre caixa, cadastra produto, registra venda e emite nota mock', async () => {
    await request(app.getHttpServer())
      .post('/pdv/caixa/abrir')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ valorAbertura: 100 })
      .expect(201);

    const produto = await request(app.getHttpServer())
      .post('/pdv/produtos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Produto E2E', precoVenda: 25, estoqueAtual: 10 })
      .expect(201);

    const venda = await request(app.getHttpServer())
      .post('/pdv/vendas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        itens: [{ produtoId: produto.body.id, quantidade: 2 }],
        formaPagamento: 'PIX',
      })
      .expect(201);

    expect(Number(venda.body.valorTotal)).toBe(50);

    const nota = await request(app.getHttpServer())
      .post(`/nfe/vendas/${venda.body.id}/emitir`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ tipo: 'NFCE' })
      .expect(201);

    expect(nota.body.status).toBe('AUTORIZADA');
  });
});
