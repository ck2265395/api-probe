import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ScenarioModel } from './scenario.model';
import { ScenarioDefinition } from './scenario.types';

@Entity('probe_scenario_version')
@Unique(['scenarioId', 'version'])
export class ScenarioVersionModel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'scenario_id', type: 'uuid' }) scenarioId!: string;
  @ManyToOne(() => ScenarioModel, (scenario) => scenario.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scenario_id' }) scenario!: ScenarioModel;
  @Column() version!: number;
  @Column({ type: 'jsonb' }) definition!: ScenarioDefinition;
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) createdAt!: Date;
}

