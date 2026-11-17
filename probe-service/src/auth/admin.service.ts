import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { CreateAdminReq } from './auth.dto';

const scrypt = promisify(scryptCallback);

interface AdminRecord {
  id: string;
  username: string;
  passwordHash: string;
}

@Injectable()
export class AdminService {
  private readonly admins = new Map<string, AdminRecord>();

  async create(input: CreateAdminReq): Promise<{ id: string; username: string }> {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scrypt(input.password, salt, 64)) as Buffer;
    const record = {
      id: randomBytes(16).toString('hex'),
      username: input.username,
      passwordHash: `${salt}:${derived.toString('hex')}`,
    };
    this.admins.set(input.username, record);
    return { id: record.id, username: record.username };
  }

  async verify(username: string, password: string): Promise<AdminRecord | null> {
    const record = this.admins.get(username);
    if (!record) return null;
    const [salt, storedHex] = record.passwordHash.split(':');
    const supplied = (await scrypt(password, salt, 64)) as Buffer;
    const stored = Buffer.from(storedHex, 'hex');
    return timingSafeEqual(stored, supplied) ? record : null;
  }
}

