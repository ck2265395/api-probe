import { RedactionService } from '../../src/common/redaction.service';

describe('RedactionService', () => {
  const redaction = new RedactionService();

  it('redacts sensitive headers and known values in nested bodies', () => {
    const result = redaction.redact(
      {
        headers: { Authorization: 'Bearer abc', 'X-Trace': 'visible' },
        body: { token: 'abc', nested: ['prefix-abc-suffix'] },
      },
      ['abc'],
    );

    expect(result).toEqual({
      headers: { Authorization: '[REDACTED]', 'X-Trace': 'visible' },
      body: { token: '[REDACTED]', nested: ['prefix-[REDACTED]-suffix'] },
    });
  });

  it('does not mutate the original value', () => {
    const original = { token: 'secret' };
    redaction.redact(original, ['secret']);
    expect(original).toEqual({ token: 'secret' });
  });
});
