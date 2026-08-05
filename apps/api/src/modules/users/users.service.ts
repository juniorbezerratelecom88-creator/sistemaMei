import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(empresaId: string, dto: CreateUserDto, criadoPorRole: RoleName) {
    const role = dto.role ?? RoleName.OPERADOR;

    if (role === RoleName.OWNER && criadoPorRole !== RoleName.OWNER) {
      throw new ForbiddenException(
        'Somente um OWNER pode criar outro usuário com papel OWNER.',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role,
        empresaId,
      },
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
