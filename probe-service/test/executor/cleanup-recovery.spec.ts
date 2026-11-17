import { CleanupRecoveryService } from '../../src/executor/cleanup-recovery.service';

describe('CleanupRecoveryService', () => {
  it('runs only ID-bound cleanup and treats an absent resource as cleaned', async () => {
    const executed: string[] = [];
    const store = {
      load: async () => ({
        context: { configId: 'config-1' },
        createStepIds: ['create'],
        cleanupSteps: [{
          id: 'cleanup', name: '删除', kind: 'CLEANUP', method: 'DELETE', path: '/configs/{{configId}}',
          cleanupForStepId: 'create', retryableCleanup: true, extractions: [], assertions: [],
        }],
      }),
      complete: async () => undefined,
    };
    const executor = { execute: async (step: { id: string }) => {
      executed.push(step.id);
      return { status: 'FAILED', httpStatus: 404, extracted: {}, sensitiveValues: [] };
    } };
    const service = new CleanupRecoveryService(store as never, executor as never);

    const result = await service.recover('run-1');

    expect(result.status).toBe('SUCCESS');
    expect(executed).toEqual(['cleanup']);
  });

  it('refuses cleanup when the bound resource ID is unavailable', async () => {
    let called = false;
    const store = {
      load: async () => ({
        context: {}, createStepIds: ['create'],
        cleanupSteps: [{ id: 'cleanup', kind: 'CLEANUP', method: 'DELETE', path: '/configs/{{configId}}', cleanupForStepId: 'create', retryableCleanup: true }],
      }),
      complete: async () => undefined,
    };
    const service = new CleanupRecoveryService(store as never, { execute: async () => { called = true; } } as never);

    const result = await service.recover('run-2');

    expect(result.status).toBe('CLEANUP_FAILED');
    expect(result.reason).toBe('无法证明清理目标属于本次运行');
    expect(called).toBe(false);
  });
});
