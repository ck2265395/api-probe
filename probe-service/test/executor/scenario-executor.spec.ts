import { ScenarioExecutor } from '../../src/executor/scenario-executor';
import { CompiledScenario } from '../../src/scenario/scenario.types';

describe('ScenarioExecutor', () => {
  it('stops normal steps after failure but runs every cleanup step', async () => {
    const executed: string[] = [];
    const persisted: string[] = [];
    const stepExecutor = {
      execute: async (step: { id: string }) => {
        executed.push(step.id);
        if (step.id === 'normal-fail') return { status: 'FAILED', extracted: {}, sensitiveValues: [] };
        if (step.id === 'cleanup-fail') return { status: 'FAILED', extracted: {}, sensitiveValues: [] };
        return { status: 'SUCCESS', extracted: {}, sensitiveValues: [] };
      },
    };
    const persistence = {
      saveStep: async (_runId: string, result: { stepId: string }) => { persisted.push(result.stepId); },
      saveRecoveryContext: async () => undefined,
    };
    const executor = new ScenarioExecutor(stepExecutor as never, persistence as never);

    const result = await executor.execute('run-1', scenario(), { runId: 'run-1' });

    expect(executed).toEqual(['normal-ok', 'normal-fail', 'cleanup-ok', 'cleanup-fail']);
    expect(persisted).toEqual(executed);
    expect(result.status).toBe('CLEANUP_FAILED');
    expect(result.skippedStepIds).toEqual(['normal-skipped']);
  });
});

function scenario(): CompiledScenario {
  const step = (id: string, kind: 'NORMAL' | 'CLEANUP') => ({
    id, name: id, kind, method: 'GET' as const, path: `/${id}`, extractions: [], assertions: [],
  });
  const normalSteps = [step('normal-ok', 'NORMAL'), step('normal-fail', 'NORMAL'), step('normal-skipped', 'NORMAL')];
  const cleanupSteps = [step('cleanup-ok', 'CLEANUP'), step('cleanup-fail', 'CLEANUP')];
  return { name: 'failure flow', variables: {}, steps: [...normalSteps, ...cleanupSteps], normalSteps, cleanupSteps };
}
