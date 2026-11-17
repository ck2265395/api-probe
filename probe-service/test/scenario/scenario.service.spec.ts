import { EnvironmentType } from '../../src/platform/environment.model';
import { ScenarioService } from '../../src/scenario/scenario.service';
import { ScenarioDefinition } from '../../src/scenario/scenario.types';

describe('ScenarioService', () => {
  it('appends immutable numbered versions when a scenario is edited', async () => {
    const scenarios: Record<string, unknown>[] = [];
    const versions: Record<string, unknown>[] = [];
    const scenarioRepo = {
      create: (value: Record<string, unknown>) => value,
      save: async (value: Record<string, unknown>) => {
        const saved = { id: 'scenario-1', ...value };
        scenarios[0] = saved;
        return saved;
      },
      findOneByOrFail: async () => scenarios[0],
    };
    const versionRepo = {
      create: (value: Record<string, unknown>) => value,
      save: async (value: Record<string, unknown>) => {
        versions.push(structuredClone(value));
        return value;
      },
      maximum: async () => versions.length,
    };
    const service = new ScenarioService(scenarioRepo as never, versionRepo as never);
    const initial = definition('初始名称');

    await service.create('platform-1', initial, EnvironmentType.TESTING, []);
    initial.name = '调用方篡改';
    await service.saveVersion('scenario-1', definition('修改名称'), EnvironmentType.TESTING, []);

    expect(versions.map((item) => item.version)).toEqual([1, 2]);
    expect((versions[0].definition as ScenarioDefinition).name).toBe('初始名称');
    expect((versions[1].definition as ScenarioDefinition).name).toBe('修改名称');
  });
});

function definition(name: string): ScenarioDefinition {
  return { name, variables: {}, steps: [] };
}
