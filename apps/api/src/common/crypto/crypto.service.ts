import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Criptografa/descriptografa campos sensíveis (tokens de terceiros,
 * segredo 2FA, certificado .pfx) com AES-256-GCM.
 *
 * Em produção, ENCRYPTION_KEY deve vir de um Vault/KMS (ex: AWS KMS,
 * HashiCorp Vault) em vez de variável de ambiente estática.
 */
@Injectable()
export class CryptoService implements OnModuleInit {
  private key!: Buffer;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const rawKey = this.config.get<string>('ENCRYPTION_KEY') ?? '';
    // Aceita chave hex de 32 bytes; caso contrário deriva uma chave via scrypt
    // (apenas para não travar o ambiente de desenvolvimento sem chave configurada).
    this.key =
      rawKey.length === 64
        ? Buffer.from(rawKey, 'hex')
        : scryptSync(rawKey || 'dev-only-insecure-key', 'sistema-mei-salt', 32);
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(cipherText: string): string {
    const buffer = Buffer.from(cipherText, 'base64');
    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = buffer.subarray(IV_LENGTH + 16);
    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }
}
