import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnvironmentType } from '../platform/environment.model';
import { compileScenario } from './compiler/scenario-compiler';
import { ScenarioModel } from './scenario.model';
import { ScenarioVersionModel } from './scenario-version.model';
import { ScenarioDefinition } from './scenario.types';

@Injectable()
export class ScenarioService {
  constructor(
    @InjectRepository(ScenarioModel) private readonly scenarios: Repository<ScenarioModel>,
    @InjectRepository(ScenarioVersionModel) private readonly versions: Repository<ScenarioVersionModel>,
  ) {}

  async create(platformId: string, definition: ScenarioDefinition, type: EnvironmentType, variables: string[]) {
    compileScenario(definition, type, variables);
    const scenario = await this.scenarios.save(this.scenarios.create({ platformId, name: definition.name, currentVersion: 1 }));
    await this.versions.save(this.versions.create({ scenarioId: scenario.id, version: 1, definition: structuredClone(definition) }));
    return scenario;
  }

  async saveVersion(id: string, definition: ScenarioDefinition, type: EnvironmentType, variables: string[]) {
    compileScenario(definition, type, variables);
    const scenario = await this.scenarios.findOneByOrFail({ id });
    const latest = (await this.versions.maximum('version', { scenarioId: id })) || 0;
    const version = latest + 1;
    await this.versions.save(this.versions.create({ scenarioId: id, version, definition: structuredClone(definition) }));
    scenario.name = definition.name;
    scenario.currentVersion = version;
    await this.scenarios.save(scenario);
    return { id, version };
  }

  validate(definition: ScenarioDefinition, type: EnvironmentType, variables: string[]) {
    return compileScenario(definition, type, variables);
  }
}

