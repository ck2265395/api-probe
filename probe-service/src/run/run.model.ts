import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StepRunModel } from './step-run.model';

export enum RunStatus {
  PENDING = 'PENDING', RUNNING = 'RUNNING', SUCCESS = 'SUCCESS', FAILED = 'FAILED',
  CLEANUP_FAILED = 'CLEANUP_FAILED', CANCELLED = 'CANCELLED', TIMED_OUT = 'TIMED_OUT',
}

@Entity('probe_run')
export class RunModel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'schedule_id', type: 'uuid', nullable: true }) scheduleId!: string | null;
  @Column({ name: 'scenario_version_id', type: 'uuid' }) scenarioVersionId!: string;
  @Column({ type: 'varchar', length: 30, default: RunStatus.PENDING }) status!: RunStatus;
  @Column({ name: 'trigger_type', length: 20 }) triggerType!: string;
  @Column({ name: 'started_at', type: 'timestamptz', nullable: true }) startedAt!: Date | null;
  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true }) finishedAt!: Date | null;
  @OneToMany(() => StepRunModel, (step) => step.run) steps!: StepRunModel[];
}

