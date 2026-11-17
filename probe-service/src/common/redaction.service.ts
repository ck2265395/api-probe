import { Injectable } from '@nestjs/common';

const SENSITIVE_KEY = /(authorization|token|cookie|secret|password|api[-_]?key)/i;
const REDACTED = '[REDACTED]';

@Injectable()
export class RedactionService {
  redact<T>(value: T, sensitiveValues: string[] = []): T {
    return this.visit(value, sensitiveValues.filter(Boolean)) as T;
  }

  private visit(value: unknown, secrets: string[], key?: string): unknown {
    if (key && SENSITIVE_KEY.test(key)) return REDACTED;
    if (typeof value === 'string') {
      return secrets.reduce((result, secret) => result.split(secret).join(REDACTED), value);
    }
    if (Array.isArray(value)) return value.map((item) => this.visit(item, secrets));
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([childKey, child]) => [childKey, this.visit(child, secrets, childKey)]),
      );
    }
    return value;
  }
}
