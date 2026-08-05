-- CreateEnum
CREATE TYPE "EventoAuditoria" AS ENUM ('LOGIN_SUCESSO', 'LOGIN_2FA_SUCESSO', 'LOGIN_FALHA');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "empresaId" TEXT,
    "email" TEXT NOT NULL,
    "evento" "EventoAuditoria" NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "cidade" TEXT,
    "pais" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_empresaId_idx" ON "AuditLog"("empresaId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
