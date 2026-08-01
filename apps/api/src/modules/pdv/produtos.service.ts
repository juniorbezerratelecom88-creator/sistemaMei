import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  create(empresaId: string, dto: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: {
        empresaId,
        nome: dto.nome,
        sku: dto.sku,
        precoVenda: dto.precoVenda,
        custoUnitario: dto.custoUnitario ?? 0,
        estoqueAtual: dto.estoqueAtual ?? 0,
        estoqueMinimo: dto.estoqueMinimo ?? 0,
      },
    });
  }

  findAll(empresaId: string) {
    return this.prisma.produto.findMany({
      where: { empresaId },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(empresaId: string, id: string) {
    const produto = await this.prisma.produto.findFirst({
      where: { id, empresaId },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }
}
