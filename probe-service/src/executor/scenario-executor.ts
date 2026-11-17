import { Injectable } from '@nestjs/common';
import { CompiledScenario, ScenarioStepDefinition } from '../scenario/scenario.types';

export type RunStatus = 'SUCCESS' | 'FAILED' | 'CLEANUP_FAILED';

export interface StepExecutionResult {
  stepId?: string;
  status: 'SUCCESS' | 'FAILED';
  extracted: Record<string, unknown>;
  sensitiveValues: string[];
}

export abstract class StepExecutionPort {
  abstract execute(step: ScenarioStepDefinition, context: Record<string, unknown>): Promise<StepExecutionResult>;
}

export abstract class RunPersistencePort {
  abstract saveStep(runId: string, result: StepExecutionResult & { stepId: string }): Promise<void>;
  abstract saveRecoveryContext(runId: string, context: Record<string, unknown>): Promise<void>;
}

@Injectable()
export class ScenarioExecutor {
  constructor(
    private readonly steps: StepExecutionPort,
    private readonly persistence: RunPersistencePort,
  ) {}

  async execute(runId: string, scenario: CompiledScenario, initialContext: Record<string, unknown>) {
    const context = { ...scenario.variables, ...initialContext };
    const skippedStepIds: string[] = [];
    let normalFailed = false;
    let cleanupFailed = false;

    for (const step of scenario.normalSteps) {
      if (normalFailed) {
        skippedStepIds.push(step.id);
        continue;
      }
      const result = await this.executeOne(runId, step, context);
      normalFailed = result.status === 'FAILED';
    }

    for (const step of scenario.cleanupSteps) {
      const result = await this.executeOne(runId, step, context);
      cleanupFailed ||= result.status === 'FAILED';
    }

    const status: RunStatus = cleanupFailed ? 'CLEANUP_FAILED' : normalFailed ? 'FAILED' : 'SUCCESS';
    return { status, skippedStepIds, context };
  }

  private async executeOne(runId: string, step: ScenarioStepDefinition, context: Record<string, unknown>) {
    const result = await this.steps.execute(step, context);
    Object.assign(context, result.extracted);
    await this.persistence.saveStep(runId, { ...result, stepId: step.id });
    await this.persistence.saveRecoveryContext(runId, context);
    return result;
  }
}
