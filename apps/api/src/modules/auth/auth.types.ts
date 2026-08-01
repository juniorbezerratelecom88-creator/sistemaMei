import { RoleName } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: RoleName;
  empresaId: string | null;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: RoleName;
  empresaId: string | null;
}
