import { AssertionEngine } from '../../src/executor/assertion-engine';
import { Extractor } from '../../src/executor/extractor';
import { TemplateRenderer } from '../../src/executor/template-renderer';

describe('executor core', () => {
  it('renders variables recursively without executing helpers', () => {
    const renderer = new TemplateRenderer();
    expect(renderer.render({ url: '{{baseUrl}}/configs/{{id}}', body: { name: '{{name}}' } }, {
      baseUrl: 'https://api.example.com', id: '42', name: 'probe',
    })).toEqual({ url: 'https://api.example.com/configs/42', body: { name: 'probe' } });
  });

  it('extracts JSONPath, headers, cookies, and body values', () => {
    const extractor = new Extractor();
    const response = {
      status: 200, durationMs: 25, headers: { 'x-id': 'header-id', 'set-cookie': ['sid=cookie-id; Path=/'] },
      body: { data: { id: 'json-id' } },
    };
    expect(extractor.extract(response, [
      { name: 'jsonId', source: 'JSON_PATH', expression: '$.data.id' },
      { name: 'headerId', source: 'HEADER', expression: 'x-id' },
      { name: 'sid', source: 'COOKIE', expression: 'sid' },
      { name: 'body', source: 'BODY' },
    ])).toEqual({ jsonId: 'json-id', headerId: 'header-id', sid: 'cookie-id', body: response.body });
  });

  it('returns an individual result for every response assertion', () => {
    const engine = new AssertionEngine();
    const results = engine.evaluate({ status: 200, durationMs: 25, headers: {}, body: { code: 0 } }, [
      { type: 'STATUS', operator: 'EQUALS', expected: 200 },
      { type: 'JSON_PATH', operator: 'EQUALS', expression: '$.code', expected: 0 },
      { type: 'DURATION', operator: 'LESS_THAN', expected: 100 },
    ]);
    expect(results).toEqual([
      expect.objectContaining({ passed: true }),
      expect.objectContaining({ passed: true }),
      expect.objectContaining({ passed: true }),
    ]);
  });
});
