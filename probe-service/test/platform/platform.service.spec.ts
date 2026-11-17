import { CryptoService } from '../../src/common/crypto.service';
import { EnvironmentType } from '../../src/platform/environment.model';
import { PlatformService } from '../../src/platform/platform.service';

describe('PlatformService', () => {
  it('encrypts environment secrets and never returns their plaintext', async () => {
    const saved: Record<string, unknown>[] = [];
    const environmentRepository = {
      create: (value: Record<string, unknown>) => value,
      save: async (value: Record<string, unknown>) => {
        saved.push(value);
        return { id: 'env-1', ...value };
      },
    };
    const service = new PlatformService(
      {} as never,
      environmentRepository as never,
      new CryptoService(Buffer.alloc(32, 3).toString('base64')),
    );

    const result = await service.createEnvironment('platform-1', {
      name: '正式环境',
      type: EnvironmentType.PRODUCTION,
      baseUrl: 'https://api.example.com',
      variables: { region: 'cn' },
      secrets: { username: 'probe-user', password: 'plain-password' },
    });

    expect(result).toEqual({
      id: 'env-1',
      platformId: 'platform-1',
      name: '正式环境',
      type: EnvironmentType.PRODUCTION,
      baseUrl: 'https://api.example.com',
      variables: { region: 'cn' },
      configuredSecrets: ['password', 'username'],
    });
    expect(JSON.stringify(saved[0])).not.toContain('plain-password');
    expect(JSON.stringify(saved[0])).not.toContain('probe-user');
  });
});
