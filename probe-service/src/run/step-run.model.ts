import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RunModel } from './run.model';

@Entity('probe_step_run')
export class StepRunModel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'run_id', type: 'uuid' }) runId!: string;
  @ManyToOne(() => RunModel, (run) => run.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'run_id' }) run!: RunModel;
  @Column({ name: 'step_id', length: 100 }) stepId!: string;
  @Column({ length: 30 }) status!: string;
  @Column({ type: 'jsonb' }) result!: Record<string, unknown>;
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) createdAt!: Date;
}

