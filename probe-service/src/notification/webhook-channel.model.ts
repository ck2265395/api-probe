import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('probe_webhook_channel')
export class WebhookChannelModel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 100 }) name!: string;
  @Column({ length: 2048 }) url!: string;
  @Column({ length: 10, default: 'POST' }) method!: string;
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" }) headers!: Record<string, string>;
  @Column({ name: 'encrypted_secret', type: 'text', nullable: true }) encryptedSecret!: string | null;
  @Column({ default: true }) enabled!: boolean;
}

