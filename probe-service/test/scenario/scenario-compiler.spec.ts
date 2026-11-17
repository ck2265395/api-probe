import { EnvironmentType } from '../../src/platform/environment.model';
import { compileScenario, ScenarioCompileError } from '../../src/scenario/compiler/scenario-compiler';
import { ScenarioDefinition } from '../../src/scenario/scenario.types';

const validScenario: ScenarioDefinition = {
  name: '配置 CRUD',
  variables: {},
  steps: [
    {
      id: 'login', name: '登录', kind: 'NORMAL', method: 'POST', path: '/login',
      body: { username: '{{username}}', password: '{{password}}' },
      extractions: [{ name: 'token', source: 'JSON_PATH', expression: '$.data.token', sensitive: true }],
      assertions: [{ type: 'STATUS', operator: 'EQUALS', expected: 201 }],
    },
    {
      id: 'create', name: '创建', kind: 'NORMAL', method: 'POST', path: '/configs',
      headers: { token: '{{token}}' }, body: { name: '__PROBE__{{runId}}' },
      lifecycle: { action: 'CREATE', resourceIdVariable: 'configId' },
      extractions: [{ name: 'configId', source: 'JSON_PATH', expression: '$.data.id' }], assertions: [],
    },
    {
      id: 'cleanup', name: '删除', kind: 'CLEANUP', method: 'DELETE', path: '/configs/{{configId}}',
      cleanupForStepId: 'create', extractions: [], assertions: [],
    },
  ],
};

describe('compileScenario', () => {
  it('compiles ordered normal and cleanup partitions for production', () => {
    const result = compileScenario(validScenario, EnvironmentType.PRODUCTION, ['username', 'password']);
    expect(result.normalSteps.map((step) => step.id)).toEqual(['login', 'create']);
    expect(result.cleanupSteps.map((step) => step.id)).toEqual(['cleanup']);
  });

  it('rejects a template variable that is never defined', () => {
    const input = structuredClone(validScenario);
    input.steps[0].path = '/{{missing}}';
    expect(() => compileScenario(input, EnvironmentType.TESTING, ['username', 'password']))
      .toThrow(new ScenarioCompileError('steps.login.path', '未定义变量 missing'));
  });

  it('rejects malformed or executable JSONPath expressions', () => {
    const input = structuredClone(validScenario);
    input.steps[0].extractions[0].expression = '$..[?(@.constructor)]';
    expect(() => compileScenario(input, EnvironmentType.TESTING, ['username', 'password']))
      .toThrow(new ScenarioCompileError('steps.login.extractions.0.expression', 'JSONPath 不安全或格式错误'));
  });

  it('rejects production create steps without an ID-bound cleanup step', () => {
    const input = structuredClone(validScenario);
    input.steps[2].cleanupForStepId = undefined;
    expect(() => compileScenario(input, EnvironmentType.PRODUCTION, ['username', 'password']))
      .toThrow(new ScenarioCompileError('steps.create.lifecycle', '生产环境创建步骤必须绑定清理步骤'));
  });
});
