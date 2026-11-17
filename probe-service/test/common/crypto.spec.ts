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
    const parts = encrypted.split('.');
    parts[3] = `${parts[3][0] === 'A' ? 'B' : 'A'}${parts[3].slice(1)}`;
    const tampered = parts.join('.');

    expect(() => crypto.decrypt(tampered)).toThrow();
  });
});
