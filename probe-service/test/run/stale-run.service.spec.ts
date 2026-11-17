import { StaleRunService } from '../../src/run/stale-run.service';

describe('StaleRunService', () => {
  it('queries only running jobs whose start time is older than the cutoff', async () => {
    let options: unknown;
    const repository = { find: async (value: unknown) => { options = value; return [{ id: 'run-1' }]; } };
    const service = new StaleRunService(repository as never);
    const cutoff = new Date('2026-11-17T00:00:00Z');

    const runs = await service.findRecoverable(cutoff);

    expect(runs).toEqual([{ id: 'run-1' }]);
    expect(options).toMatchObject({ where: { status: 'RUNNING' } });
  });
});
