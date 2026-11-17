import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoService } from '../common/crypto.service';
import { CreateWebhookChannelReq } from './webhook-channel.dto';
import { WebhookChannelModel } from './webhook-channel.model';

@Injectable()
export class WebhookChannelService {
  constructor(
    @InjectRepository(WebhookChannelModel) private readonly channels: Repository<WebhookChannelModel>,
    private readonly crypto: CryptoService,
  ) {}

  async create(input: CreateWebhookChannelReq) {
    const saved = await this.channels.save(this.channels.create({
      name: input.name,
      url: input.url,
      method: 'POST',
      headers: input.headers || {},
      encryptedSecret: input.secret ? this.crypto.encrypt(input.secret) : null,
    }));
    return this.toView(saved);
  }

  async list() {
    return (await this.channels.find({ order: { name: 'ASC' } })).map((channel) => this.toView(channel));
  }

  private toView(channel: WebhookChannelModel) {
    return {
      id: channel.id,
      name: channel.name,
      url: channel.url,
      method: channel.method,
      headers: channel.headers,
      enabled: channel.enabled,
      secretConfigured: Boolean(channel.encryptedSecret),
    };
  }
}

