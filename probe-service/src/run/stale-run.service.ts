import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RunModel, RunStatus } from './run.model';

@Injectable()
export class StaleRunService {
  constructor(@InjectRepository(RunModel) private readonly runs: Repository<RunModel>) {}

  findRecoverable(cutoff: Date): Promise<RunModel[]> {
    return this.runs.find({
      where: { status: RunStatus.RUNNING, startedAt: LessThan(cutoff) },
      order: { startedAt: 'ASC' },
    });
  }
}
