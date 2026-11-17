import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('probe_run_context')
export class RunContextModel {
  @PrimaryColumn({ name: 'run_id', type: 'uuid' }) runId!: string;
  @Column({ name: 'encrypted_context', type: 'text' }) encryptedContext!: string;
  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) updatedAt!: Date;
}

