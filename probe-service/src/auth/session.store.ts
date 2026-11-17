import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

export interface SessionRecord {
  adminId: string;
  expiresAt: number;
}

export abstract class SessionStore {
  abstract create(adminId: string): Promise<string>;
  abstract get(token: string): Promise<SessionRecord | null>;
}

@Injectable()
export class MemorySessionStore extends SessionStore {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly ttlMs = 7 * 24 * 60 * 60 * 1000;

  async create(adminId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    this.sessions.set(token, { adminId, expiresAt: Date.now() + this.ttlMs });
    return token;
  }

  async get(token: string): Promise<SessionRecord | null> {
    const session = this.sessions.get(token);
    if (!session || session.expiresAt <= Date.now()) return null;
    session.expiresAt = Date.now() + this.ttlMs;
    return session;
  }
}

