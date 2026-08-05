import { ConflictException, Injectable } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEmpresaDto) {
    const existing = await this.prisma.empresa.findUnique({
      where: { cnpj: dto.cnpj },
    });
    if (existing) {
      throw new ConflictException('CNPJ já cadastrado.');
    }

    return this.prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          cnpj: dto.cnpj,
          razaoSocial: dto.razaoSocial,
          nomeFantasia: dto.nomeFantasia,
          atividade: dto.atividade,
          dataAbertura: new Date(dto.dataAbertura),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { empresaId: empresa.id, role: RoleName.OWNER },
      });

      return empresa;
    });
  }

  findById(id: string) {
    return this.prisma.empresa.findUniqueOrThrow({ where: { id } });
  }

  async update(empresaId: string, dto: UpdateEmpresaDto) {
    if (dto.cnpj) {
      const existing = await this.prisma.empresa.findUnique({
        where: { cnpj: dto.cnpj },
      });
      if (existing && existing.id !== empresaId) {
        throw new ConflictException('CNPJ já cadastrado para outra empresa.');
      }
    }

    return this.prisma.empresa.update({
      where: { id: empresaId },
      data: dto,
    });
  }

  updateLogo(empresaId: string, logoUrl: string) {
    return this.prisma.empresa.update({
      where: { id: empresaId },
      data: { logoUrl },
    });
  }
}
