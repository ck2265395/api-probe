import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { WebhookChannelModel } from './notification/webhook-channel.model';
import { EnvironmentModel } from './platform/environment.model';
import { PlatformModel } from './platform/platform.model';
import { PlatformModule } from './platform/platform.module';
import { ScenarioModule } from './scenario/scenario.module';
import { ScenarioModel } from './scenario/scenario.model';
import { ScenarioVersionModel } from './scenario/scenario-version.model';

const databaseImports = process.env.DATABASE_URL
  ? [
      TypeOrmModule.forRoot({
        type: 'postgres' as const,
        url: process.env.DATABASE_URL,
        entities: [PlatformModel, EnvironmentModel, WebhookChannelModel, ScenarioModel, ScenarioVersionModel],
        synchronize: false,
      }),
      PlatformModule,
      NotificationModule,
      ScenarioModule,
    ]
  : [];

@Module({ imports: [AuthModule, ...databaseImports] })
export class AppModule {}
