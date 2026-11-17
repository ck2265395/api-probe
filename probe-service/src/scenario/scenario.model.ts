import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ScenarioVersionModel } from './scenario-version.model';

@Entity('probe_scenario')
export class ScenarioModel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'platform_id', type: 'uuid' }) platformId!: string;
  @Column({ length: 150 }) name!: string;
  @Column({ default: true }) enabled!: boolean;
  @Column({ name: 'current_version', default: 1 }) currentVersion!: number;
  @OneToMany(() => ScenarioVersionModel, (version) => version.scenario) versions!: ScenarioVersionModel[];
}

