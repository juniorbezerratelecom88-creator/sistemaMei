import { ConflictException, Injectable } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';

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
}
