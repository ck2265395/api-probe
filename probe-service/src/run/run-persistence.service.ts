import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoService } from '../common/crypto.service';
import { RedactionService } from '../common/redaction.service';
import { RunPersistencePort, StepExecutionResult } from '../executor/scenario-executor';
import { RunContextModel } from './run-context.model';
import { StepRunModel } from './step-run.model';

type PersistedStepInput = StepExecutionResult & { stepId: string } & Record<string, unknown>;

@Injectable()
export class RunPersistenceService extends RunPersistencePort {
  constructor(
    @InjectRepository(StepRunModel) private readonly steps: Repository<StepRunModel>,
    @InjectRepository(RunContextModel) private readonly contexts: Repository<RunContextModel>,
    private readonly crypto: CryptoService,
    private readonly redaction: RedactionService,
  ) { super(); }

  async saveStep(runId: string, input: PersistedStepInput): Promise<void> {
    const { sensitiveValues, stepId, status, ...details } = input;
    await this.steps.save(this.steps.create({
      runId,
      stepId,
      status,
      result: this.redaction.redact(details, sensitiveValues),
    }));
  }

  async saveRecoveryContext(runId: string, context: Record<string, unknown>): Promise<void> {
    await this.contexts.save(this.contexts.create({
      runId,
      encryptedContext: this.crypto.encrypt(JSON.stringify(context)),
    }));
  }
}

