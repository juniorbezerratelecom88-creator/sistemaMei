import { Injectable, NotFoundException } from '@nestjs/common';
import { ContaPagarStatus, ContaReceberStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContaPagarDto } from './dto/conta-pagar.dto';
import { CreateContaReceberDto } from './dto/conta-receber.dto';

@Injectable()
export class ContasService {
  constructor(private readonly prisma: PrismaService) {}

  criarContaPagar(empresaId: string, dto: CreateContaPagarDto) {
    return this.prisma.contaPagar.create({
      data: { empresaId, ...dto, vencimento: new Date(dto.vencimento) },
    });
  }

  listarContasPagar(empresaId: string) {
    return this.prisma.contaPagar.findMany({
      where: { empresaId },
      orderBy: { vencimento: 'asc' },
    });
  }

  async pagarContaPagar(empresaId: string, id: string) {
    const conta = await this.prisma.contaPagar.findFirst({
      where: { id, empresaId },
    });
    if (!conta) throw new NotFoundException('Conta a pagar não encontrada.');
    return this.prisma.contaPagar.update({
      where: { id },
      data: { status: ContaPagarStatus.PAGO, pagoEm: new Date() },
    });
  }

  criarContaReceber(empresaId: string, dto: CreateContaReceberDto) {
    return this.prisma.contaReceber.create({
      data: { empresaId, ...dto, vencimento: new Date(dto.vencimento) },
    });
  }

  listarContasReceber(empresaId: string) {
    return this.prisma.contaReceber.findMany({
      where: { empresaId },
      orderBy: { vencimento: 'asc' },
    });
  }

  async receberContaReceber(empresaId: string, id: string) {
    const conta = await this.prisma.contaReceber.findFirst({
      where: { id, empresaId },
    });
    if (!conta) throw new NotFoundException('Conta a receber não encontrada.');
    return this.prisma.contaReceber.update({
      where: { id },
      data: { status: ContaReceberStatus.RECEBIDO, recebidoEm: new Date() },
    });
  }
}
