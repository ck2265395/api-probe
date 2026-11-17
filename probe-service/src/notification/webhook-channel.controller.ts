import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/session.guard';
import { success } from '../common/response';
import { CreateWebhookChannelReq } from './webhook-channel.dto';
import { WebhookChannelService } from './webhook-channel.service';

@Controller('api/v1/admin/webhook-channels')
@UseGuards(SessionGuard)
export class WebhookChannelController {
  constructor(private readonly service: WebhookChannelService) {}
  @Get() async list() { return success(await this.service.list()); }
  @Post() async create(@Body() input: CreateWebhookChannelReq) { return success(await this.service.create(input)); }
}

