import { CryptoService } from '../../src/common/crypto.service';
import { RedactionService } from '../../src/common/redaction.service';
import { RunPersistenceService } from '../../src/run/run-persistence.service';

describe('RunPersistenceService', () => {
  it('redacts step data and encrypts recovery context before storage', async () => {
    const stepRows: Record<string, unknown>[] = [];
    const contextRows: Record<string, unknown>[] = [];
    const repo = (rows: Record<string, unknown>[]) => ({
      create: (value: Record<string, unknown>) => value,
      save: async (value: Record<string, unknown>) => { rows.push(value); return value; },
    });
    const crypto = new CryptoService(Buffer.alloc(32, 5).toString('base64'));
    const service = new RunPersistenceService(
      repo(stepRows) as never, repo(contextRows) as never, crypto, new RedactionService(),
    );

    await service.saveStep('run-1', {
      stepId: 'login', status: 'SUCCESS', extracted: { token: 'secret-token' },
      sensitiveValues: ['secret-token'], request: { headers: { token: 'secret-token' } },
    });
    await service.saveRecoveryContext('run-1', { configId: 'config-1', token: 'secret-token' });

    expect(JSON.stringify(stepRows)).not.toContain('secret-token');
    expect(JSON.stringify(contextRows)).not.toContain('secret-token');
    expect(crypto.decrypt(String(contextRows[0].encryptedContext))).toContain('config-1');
  });
});
