import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PlatformModel } from './platform.model';

export enum EnvironmentType {
  DEVELOPMENT = 'DEVELOPMENT',
  TESTING = 'TESTING',
  PRODUCTION = 'PRODUCTION',
}

@Entity('probe_environment')
export class EnvironmentModel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'platform_id', type: 'uuid' }) platformId!: string;
  @ManyToOne(() => PlatformModel, (platform) => platform.environments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'platform_id' }) platform!: PlatformModel;
  @Column({ length: 100 }) name!: string;
  @Column({ type: 'enum', enum: EnvironmentType }) type!: EnvironmentType;
  @Column({ name: 'base_url', length: 2048 }) baseUrl!: string;
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" }) variables!: Record<string, string>;
  @Column({ name: 'encrypted_secrets', type: 'jsonb', default: () => "'{}'::jsonb" }) encryptedSecrets!: Record<string, string>;
  @Column({ name: 'tls_verify', default: true }) tlsVerify!: boolean;
  @Column({ name: 'timeout_ms', default: 10000 }) timeoutMs!: number;
  @Column({ default: true }) enabled!: boolean;
}

