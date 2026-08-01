import { Injectable } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByEmpresa(empresaId: string) {
    return this.prisma.user.findMany({
      where: { empresaId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isTwoFactorEnabled: true,
        createdAt: true,
      },
    });
  }

  updateRole(userId: string, role: RoleName) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, role: true },
    });
  }

  linkToEmpresa(userId: string, empresaId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { empresaId },
      select: { id: true, empresaId: true },
    });
  }
}
