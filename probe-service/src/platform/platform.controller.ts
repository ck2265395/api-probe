import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/session.guard';
import { success } from '../common/response';
import { CreateEnvironmentReq, CreatePlatformReq } from './platform.dto';
import { PlatformService } from './platform.service';

@Controller('api/v1/admin/platforms')
@UseGuards(SessionGuard)
export class PlatformController {
  constructor(private readonly service: PlatformService) {}
  @Get() async list() { return success(await this.service.listPlatforms()); }
  @Post() async create(@Body() input: CreatePlatformReq) { return success(await this.service.createPlatform(input)); }
  @Post(':platformId/environments')
  async createEnvironment(@Param('platformId') id: string, @Body() input: CreateEnvironmentReq) {
    return success(await this.service.createEnvironment(id, input));
  }
}

