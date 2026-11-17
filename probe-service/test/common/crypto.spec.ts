import { CryptoService } from '../../src/common/crypto.service';

describe('CryptoService', () => {
  const key = Buffer.alloc(32, 7).toString('base64');
  const crypto = new CryptoService(key);

  it('encrypts values with a unique nonce and decrypts them', () => {
    const first = crypto.encrypt('probe-password');
    const second = crypto.encrypt('probe-password');

    expect(first).not.toBe(second);
    expect(crypto.decrypt(first)).toBe('probe-password');
    expect(crypto.decrypt(second)).toBe('probe-password');
  });

  it('rejects ciphertext modified after encryption', () => {
    const encrypted = crypto.encrypt('probe-password');
    const tampered = `${encrypted.slice(0, -1)}${encrypted.endsWith('A') ? 'B' : 'A'}`;

    expect(() => crypto.decrypt(tampered)).toThrow();
  });
});

