import { AtividadeMei, PrismaClient, RoleName } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Senha@Forte123', { type: argon2.argon2id });

  const empresa = await prisma.empresa.upsert({
    where: { cnpj: '12345678000199' },
    update: {},
    create: {
      cnpj: '12345678000199',
      razaoSocial: 'MEI Exemplo Comércio de Roupas',
      nomeFantasia: 'Loja Exemplo',
      atividade: AtividadeMei.COMERCIO,
      dataAbertura: new Date('2024-01-15'),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sistemamei.com.br' },
    update: {},
    create: {
      email: 'admin@sistemamei.com.br',
      name: 'Administrador MEI',
      passwordHash,
      role: RoleName.OWNER,
      empresaId: empresa.id,
    },
  });

  const produto = await prisma.produto.upsert({
    where: { id: 'seed-produto-camiseta' },
    update: {},
    create: {
      id: 'seed-produto-camiseta',
      empresaId: empresa.id,
      nome: 'Camiseta Básica',
      sku: 'CAM-001',
      precoVenda: 49.9,
      custoUnitario: 20,
      estoqueAtual: 50,
      estoqueMinimo: 5,
    },
  });

  console.log('Seed concluído:', { empresa: empresa.razaoSocial, admin: admin.email, produto: produto.nome });
  console.log('Login de teste -> email: admin@sistemamei.com.br | senha: Senha@Forte123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
