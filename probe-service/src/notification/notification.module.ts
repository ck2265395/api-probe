import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoService } from '../common/crypto.service';
import { WebhookChannelController } from './webhook-channel.controller';
import { WebhookChannelModel } from './webhook-channel.model';
import { WebhookChannelService } from './webhook-channel.service';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookChannelModel])],
  controllers: [WebhookChannelController],
  providers: [WebhookChannelService, CryptoService],
  exports: [WebhookChannelService],
})
export class NotificationModule {}
