import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoService } from '../common/crypto.service';
import { RedactionService } from '../common/redaction.service';
import { RunContextModel } from './run-context.model';
import { RunPersistenceService } from './run-persistence.service';
import { RunModel } from './run.model';
import { StepRunModel } from './step-run.model';
import { StaleRunService } from './stale-run.service';

@Module({
  imports: [TypeOrmModule.forFeature([RunModel, StepRunModel, RunContextModel])],
  providers: [RunPersistenceService, StaleRunService, CryptoService, RedactionService],
  exports: [RunPersistenceService, StaleRunService],
})
export class RunModule {}
