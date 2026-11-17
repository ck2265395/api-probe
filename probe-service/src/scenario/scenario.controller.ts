import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/session.guard';
import { success } from '../common/response';
import { EnvironmentType } from '../platform/environment.model';
import { ScenarioDefinition } from './scenario.types';
import { ScenarioService } from './scenario.service';

interface ScenarioWriteBody {
  definition: ScenarioDefinition;
  environmentType: EnvironmentType;
  environmentVariableNames?: string[];
}

@Controller('api/v1/admin/scenarios')
@UseGuards(SessionGuard)
export class ScenarioController {
  constructor(private readonly service: ScenarioService) {}
  @Post('validate') validate(@Body() body: ScenarioWriteBody) {
    return success(this.service.validate(body.definition, body.environmentType, body.environmentVariableNames || []));
  }
  @Post('platform/:platformId') async create(@Param('platformId') id: string, @Body() body: ScenarioWriteBody) {
    return success(await this.service.create(id, body.definition, body.environmentType, body.environmentVariableNames || []));
  }
  @Put(':id') async save(@Param('id') id: string, @Body() body: ScenarioWriteBody) {
    return success(await this.service.saveVersion(id, body.definition, body.environmentType, body.environmentVariableNames || []));
  }
}

