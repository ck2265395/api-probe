import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EnvironmentModel } from './environment.model';

@Entity('probe_platform')
export class PlatformModel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 100 }) name!: string;
  @Column({ length: 100, unique: true }) code!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ default: true }) enabled!: boolean;
  @OneToMany(() => EnvironmentModel, (environment) => environment.platform) environments!: EnvironmentModel[];
}

