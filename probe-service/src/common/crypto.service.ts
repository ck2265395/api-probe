import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor(masterKey = process.env.PROBE_MASTER_KEY || '') {
    this.key = Buffer.from(masterKey, 'base64');
    if (this.key.length !== 32) throw new Error('PROBE_MASTER_KEY must be a base64-encoded 32-byte key');
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return ['v1', iv, cipher.getAuthTag(), ciphertext]
      .map((part) => (typeof part === 'string' ? part : part.toString('base64url')))
      .join('.');
  }

  decrypt(payload: string): string {
    const [version, iv, tag, ciphertext] = payload.split('.');
    if (version !== 'v1' || !iv || !tag || !ciphertext) throw new Error('Invalid encrypted payload');
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }
}

