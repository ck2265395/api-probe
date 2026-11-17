import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoService } from '../common/crypto.service';
import { RedactionService } from '../common/redaction.service';
import { RunContextModel } from './run-context.model';
import { RunPersistenceService } from './run-persistence.service';
import { RunModel } from './run.model';
import { StepRunModel } from './step-run.model';

@Module({
  imports: [TypeOrmModule.forFeature([RunModel, StepRunModel, RunContextModel])],
  providers: [RunPersistenceService, CryptoService, RedactionService],
  exports: [RunPersistenceService],
})
export class RunModule {}
