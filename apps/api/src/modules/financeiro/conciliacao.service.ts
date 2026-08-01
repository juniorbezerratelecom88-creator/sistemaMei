import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ContaPagarStatus,
  ContaReceberStatus,
  TipoTransacaoBancaria,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { BANK_GATEWAY, BankGateway } from './bank-gateway.interface';
import { ConectarContaBancariaDto } from './dto/conectar-conta-bancaria.dto';

const TOLERANCIA_CENTAVOS = 0.01;

@Injectable()
export class ConciliacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    @Inject(BANK_GATEWAY) private readonly bankGateway: BankGateway,
  ) {}

  conectarConta(empresaId: string, dto: ConectarContaBancariaDto) {
    return this.prisma.contaBancaria.create({
      data: {
        empresaId,
        provider: dto.provider,
        apelido: dto.apelido,
        accessTokenCifrado: this.crypto.encrypt(dto.accessToken),
      },
      select: { id: true, provider: true, apelido: true, createdAt: true },
    });
  }

  listarContas(empresaId: string) {
    return this.prisma.contaBancaria.findMany({
      where: { empresaId },
      select: {
        id: true,
        provider: true,
        apelido: true,
        ultimaSincronizacao: true,
      },
    });
  }

  async sincronizar(empresaId: string, contaBancariaId: string) {
    const conta = await this.prisma.contaBancaria.findFirst({
      where: { id: contaBancariaId, empresaId },
    });
    if (!conta) throw new NotFoundException('Conta bancária não encontrada.');

    const accessToken = this.crypto.decrypt(conta.accessTokenCifrado);
    const transacoesImportadas =
      await this.bankGateway.sincronizarTransacoes(accessToken);

    const transacoesCriadas = await this.prisma.$transaction(
      transacoesImportadas.map((transacao) =>
        this.prisma.transacaoBancaria.create({
          data: {
            contaBancariaId,
            dataTransacao: transacao.dataTransacao,
            descricao: transacao.descricao,
            valor: transacao.valor,
            tipo: transacao.tipo as TipoTransacaoBancaria,
          },
        }),
      ),
    );

    await this.prisma.contaBancaria.update({
      where: { id: contaBancariaId },
      data: { ultimaSincronizacao: new Date() },
    });

    return this.conciliarPendentes(
      empresaId,
      contaBancariaId,
      transacoesCriadas.map((t) => t.id),
    );
  }

  /** Tenta casar transações importadas com contas a pagar/receber pendentes de mesmo valor. */
  private async conciliarPendentes(
    empresaId: string,
    contaBancariaId: string,
    transacaoIds: string[],
  ) {
    const transacoes = await this.prisma.transacaoBancaria.findMany({
      where: { id: { in: transacaoIds }, conciliada: false },
    });

    const resultado: {
      transacaoId: string;
      conciliada: boolean;
      tipo?: string;
    }[] = [];

    for (const transacao of transacoes) {
      if (transacao.tipo === TipoTransacaoBancaria.CREDITO) {
        const contaReceber = await this.prisma.contaReceber.findFirst({
          where: {
            empresaId,
            status: ContaReceberStatus.PENDENTE,
            valor: {
              gte: Number(transacao.valor) - TOLERANCIA_CENTAVOS,
              lte: Number(transacao.valor) + TOLERANCIA_CENTAVOS,
            },
          },
        });
        if (contaReceber) {
          await this.prisma.$transaction([
            this.prisma.contaReceber.update({
              where: { id: contaReceber.id },
              data: {
                status: ContaReceberStatus.RECEBIDO,
                recebidoEm: transacao.dataTransacao,
              },
            }),
            this.prisma.transacaoBancaria.update({
              where: { id: transacao.id },
              data: { conciliada: true, contaReceberId: contaReceber.id },
            }),
          ]);
          resultado.push({
            transacaoId: transacao.id,
            conciliada: true,
            tipo: 'contaReceber',
          });
          continue;
        }
      } else {
        const contaPagar = await this.prisma.contaPagar.findFirst({
          where: {
            empresaId,
            status: ContaPagarStatus.PENDENTE,
            valor: {
              gte: Number(transacao.valor) - TOLERANCIA_CENTAVOS,
              lte: Number(transacao.valor) + TOLERANCIA_CENTAVOS,
            },
          },
        });
        if (contaPagar) {
          await this.prisma.$transaction([
            this.prisma.contaPagar.update({
              where: { id: contaPagar.id },
              data: {
                status: ContaPagarStatus.PAGO,
                pagoEm: transacao.dataTransacao,
              },
            }),
            this.prisma.transacaoBancaria.update({
              where: { id: transacao.id },
              data: { conciliada: true, contaPagarId: contaPagar.id },
            }),
          ]);
          resultado.push({
            transacaoId: transacao.id,
            conciliada: true,
            tipo: 'contaPagar',
          });
          continue;
        }
      }
      resultado.push({ transacaoId: transacao.id, conciliada: false });
    }

    return { contaBancariaId, resultado };
  }

  listarTransacoes(contaBancariaId: string) {
    return this.prisma.transacaoBancaria.findMany({
      where: { contaBancariaId },
      orderBy: { dataTransacao: 'desc' },
    });
  }
}
