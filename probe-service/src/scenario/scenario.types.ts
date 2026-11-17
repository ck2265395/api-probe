export type StepKind = 'NORMAL' | 'CLEANUP';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export interface ExtractionDefinition {
  name: string;
  source: 'JSON_PATH' | 'HEADER' | 'COOKIE' | 'BODY';
  expression?: string;
  sensitive?: boolean;
}

export interface AssertionDefinition {
  type: 'STATUS' | 'JSON_PATH' | 'HEADER' | 'DURATION';
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'EXISTS' | 'NOT_EXISTS' | 'LESS_THAN';
  expression?: string;
  expected?: unknown;
}

export interface ScenarioStepDefinition {
  id: string;
  name: string;
  kind: StepKind;
  method: HttpMethod;
  path: string;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  extractions: ExtractionDefinition[];
  assertions: AssertionDefinition[];
  lifecycle?: { action: 'CREATE'; resourceIdVariable: string };
  cleanupForStepId?: string;
  retryableCleanup?: boolean;
  enabled?: boolean;
}

export interface ScenarioDefinition {
  name: string;
  variables: Record<string, string>;
  steps: ScenarioStepDefinition[];
}

export interface CompiledScenario extends ScenarioDefinition {
  normalSteps: ScenarioStepDefinition[];
  cleanupSteps: ScenarioStepDefinition[];
}

