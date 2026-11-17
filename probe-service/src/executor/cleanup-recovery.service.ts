import { Injectable } from '@nestjs/common';
import { ScenarioStepDefinition } from '../scenario/scenario.types';
import { StepExecutionPort } from './scenario-executor';

export interface RecoveryData {
  context: Record<string, unknown>;
  createStepIds: string[];
  cleanupSteps: ScenarioStepDefinition[];
}

export abstract class CleanupRecoveryStore {
  abstract load(runId: string): Promise<RecoveryData>;
  abstract complete(runId: string, status: 'SUCCESS' | 'CLEANUP_FAILED'): Promise<void>;
}

@Injectable()
export class CleanupRecoveryService {
  constructor(
    private readonly store: CleanupRecoveryStore,
    private readonly executor: StepExecutionPort,
  ) {}

  async recover(runId: string): Promise<{ status: 'SUCCESS' | 'CLEANUP_FAILED'; reason?: string }> {
    const data = await this.store.load(runId);
    for (const step of data.cleanupSteps.filter((item) => item.retryableCleanup)) {
      const variable = step.path.match(/{{\s*([A-Za-z_][A-Za-z0-9_]*)\s*}}/)?.[1];
      const ownsCreateStep = Boolean(step.cleanupForStepId && data.createStepIds.includes(step.cleanupForStepId));
      if (!variable || data.context[variable] === undefined || !ownsCreateStep) {
        await this.store.complete(runId, 'CLEANUP_FAILED');
        return { status: 'CLEANUP_FAILED', reason: '无法证明清理目标属于本次运行' };
      }
      const result = await this.executor.execute(step, data.context) as { status: string; httpStatus?: number };
      if (result.status !== 'SUCCESS' && result.httpStatus !== 404) {
        await this.store.complete(runId, 'CLEANUP_FAILED');
        return { status: 'CLEANUP_FAILED', reason: '清理请求失败' };
      }
    }
    await this.store.complete(runId, 'SUCCESS');
    return { status: 'SUCCESS' };
  }
}
