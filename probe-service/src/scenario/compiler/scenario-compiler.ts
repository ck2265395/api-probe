import Handlebars from 'handlebars';
import { EnvironmentType } from '../../platform/environment.model';
import { CompiledScenario, ScenarioDefinition, ScenarioStepDefinition } from '../scenario.types';

export class ScenarioCompileError extends Error {
  constructor(readonly field: string, message: string) {
    super(message);
    this.name = 'ScenarioCompileError';
  }
}

const BUILT_INS = ['runId', 'startedAt', 'baseUrl'];
const TEMPLATE_VARIABLE = /{{\s*([A-Za-z_][A-Za-z0-9_.-]*)\s*}}/g;
const UNSAFE_JSON_PATH = /(?:\?\s*\(|\bconstructor\b|\bprototype\b|__proto__)/i;

function validateTemplate(value: unknown, field: string, known: Set<string>): void {
  if (typeof value === 'string') {
    try { Handlebars.parse(value); } catch { throw new ScenarioCompileError(field, '模板格式错误'); }
    if (/{{\s*[#/>]/.test(value)) throw new ScenarioCompileError(field, '模板仅允许变量替换');
    for (const match of value.matchAll(TEMPLATE_VARIABLE)) {
      const root = match[1].split('.')[0];
      if (!known.has(root)) throw new ScenarioCompileError(field, `未定义变量 ${root}`);
    }
    return;
  }
  if (Array.isArray(value)) value.forEach((child, index) => validateTemplate(child, `${field}.${index}`, known));
  else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => validateTemplate(child, `${field}.${key}`, known));
  }
}

function validateJsonPath(expression: string | undefined, field: string): void {
  if (!expression || !expression.startsWith('$') || UNSAFE_JSON_PATH.test(expression)) {
    throw new ScenarioCompileError(field, 'JSONPath 不安全或格式错误');
  }
}

function validateStep(step: ScenarioStepDefinition, known: Set<string>): void {
  validateTemplate(step.path, `steps.${step.id}.path`, known);
  validateTemplate(step.query, `steps.${step.id}.query`, known);
  validateTemplate(step.headers, `steps.${step.id}.headers`, known);
  validateTemplate(step.body, `steps.${step.id}.body`, known);
  step.extractions.forEach((extraction, index) => {
    if (extraction.source === 'JSON_PATH') {
      validateJsonPath(extraction.expression, `steps.${step.id}.extractions.${index}.expression`);
    }
    if (known.has(extraction.name)) {
      throw new ScenarioCompileError(`steps.${step.id}.extractions.${index}.name`, `变量 ${extraction.name} 重复定义`);
    }
    known.add(extraction.name);
  });
}

export function compileScenario(
  definition: ScenarioDefinition,
  environmentType: EnvironmentType,
  environmentVariableNames: string[] = [],
): CompiledScenario {
  const enabled = definition.steps.filter((step) => step.enabled !== false);
  const normalSteps = enabled.filter((step) => step.kind === 'NORMAL');
  const cleanupSteps = enabled.filter((step) => step.kind === 'CLEANUP');
  const known = new Set([...BUILT_INS, ...Object.keys(definition.variables), ...environmentVariableNames]);

  normalSteps.forEach((step) => validateStep(step, known));
  cleanupSteps.forEach((step) => validateStep(step, known));

  if (environmentType === EnvironmentType.PRODUCTION) {
    normalSteps.filter((step) => step.lifecycle?.action === 'CREATE').forEach((createStep) => {
      const cleanup = cleanupSteps.find((step) => step.cleanupForStepId === createStep.id);
      const resourceId = createStep.lifecycle?.resourceIdVariable;
      const extractsId = createStep.extractions.some((item) => item.name === resourceId);
      const cleanupUsesId = resourceId && cleanup?.path.includes(`{{${resourceId}}}`);
      if (!cleanup || !extractsId || !cleanupUsesId) {
        throw new ScenarioCompileError(`steps.${createStep.id}.lifecycle`, '生产环境创建步骤必须绑定清理步骤');
      }
    });
  }

  return { ...definition, steps: enabled, normalSteps, cleanupSteps };
}
