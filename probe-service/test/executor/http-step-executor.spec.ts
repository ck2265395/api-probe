import { AssertionEngine } from '../../src/executor/assertion-engine';
import { Extractor } from '../../src/executor/extractor';
import { HttpStepExecutor } from '../../src/executor/http-step-executor';
import { TemplateRenderer } from '../../src/executor/template-renderer';

describe('HttpStepExecutor', () => {
  it('builds a request and returns extracted variables with assertion results', async () => {
    const client = {
      request: async (config: Record<string, unknown>) => ({
        status: 201,
        headers: { 'x-request-id': 'req-1' },
        data: { code: 0, data: { id: 'config-1' } },
        config,
      }),
    };
    const executor = new HttpStepExecutor(
      client as never, new TemplateRenderer(), new Extractor(), new AssertionEngine(),
    );
    const result = await executor.execute({
      id: 'create', name: '创建', kind: 'NORMAL', method: 'POST', path: '/configs',
      headers: { token: '{{token}}' }, body: { name: '{{name}}' },
      extractions: [{ name: 'configId', source: 'JSON_PATH', expression: '$.data.id' }],
      assertions: [{ type: 'STATUS', operator: 'EQUALS', expected: 201 }],
    }, { baseUrl: 'https://api.example.com', token: 'secret', name: 'probe' });

    expect(result.status).toBe('SUCCESS');
    expect(result.extracted).toEqual({ configId: 'config-1' });
    expect(result.request).toMatchObject({ url: 'https://api.example.com/configs', method: 'POST' });
    expect(result.assertions).toEqual([expect.objectContaining({ passed: true })]);
  });
});
