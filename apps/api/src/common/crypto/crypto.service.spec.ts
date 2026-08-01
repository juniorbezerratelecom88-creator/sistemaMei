import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    const config = { get: () => 'a'.repeat(64) } as unknown as ConfigService;
    service = new CryptoService(config);
    service.onModuleInit();
  });

  it('criptografa e descriptografa mantendo o valor original', () => {
    const original = 'segredo-super-sensivel-123';
    const cifrado = service.encrypt(original);

    expect(cifrado).not.toEqual(original);
    expect(service.decrypt(cifrado)).toEqual(original);
  });

  it('gera saídas diferentes para a mesma entrada (IV aleatório)', () => {
    const a = service.encrypt('mesmo-valor');
    const b = service.encrypt('mesmo-valor');
    expect(a).not.toEqual(b);
  });
});
