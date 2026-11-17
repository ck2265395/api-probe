import { CryptoService } from '../../src/common/crypto.service';
import { WebhookChannelService } from '../../src/notification/webhook-channel.service';

describe('WebhookChannelService', () => {
  it('stores multiple channels without returning signing secrets', async () => {
    const rows: Record<string, unknown>[] = [];
    const repository = {
      create: (value: Record<string, unknown>) => value,
      save: async (value: Record<string, unknown>) => {
        const saved = { id: `channel-${rows.length + 1}`, ...value };
        rows.push(saved);
        return saved;
      },
      find: async () => rows,
    };
    const service = new WebhookChannelService(
      repository as never,
      new CryptoService(Buffer.alloc(32, 4).toString('base64')),
    );

    await service.create({ name: 'ops', url: 'https://hooks.example.com/ops', secret: 'ops-key' });
    await service.create({ name: 'dev', url: 'https://hooks.example.com/dev', secret: 'dev-key' });
    const result = await service.list();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: 'channel-1', name: 'ops', secretConfigured: true });
    expect(JSON.stringify(result)).not.toContain('ops-key');
    expect(JSON.stringify(rows)).not.toContain('ops-key');
  });
});
