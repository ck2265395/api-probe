import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ScenarioStepDefinition } from '../scenario/scenario.types';
import { AssertionEngine } from './assertion-engine';
import { Extractor } from './extractor';
import { StepExecutionPort, StepExecutionResult } from './scenario-executor';
import { TemplateRenderer } from './template-renderer';

@Injectable()
export class HttpStepExecutor extends StepExecutionPort {
  constructor(
    private readonly client: AxiosInstance = axios.create(),
    private readonly renderer = new TemplateRenderer(),
    private readonly extractor = new Extractor(),
    private readonly assertionsEngine = new AssertionEngine(),
  ) { super(); }

  async execute(step: ScenarioStepDefinition, context: Record<string, unknown>): Promise<StepExecutionResult & {
    request: Record<string, unknown>;
    assertions: ReturnType<AssertionEngine['evaluate']>;
    durationMs: number;
  }> {
    const request = {
      url: `${String(context.baseUrl).replace(/\/$/, '')}${this.renderer.render(step.path, context)}`,
      method: step.method,
      params: this.renderer.render(step.query || {}, context),
      headers: this.renderer.render(step.headers || {}, context),
      data: this.renderer.render(step.body, context),
      timeout: step.timeoutMs || 10000,
      validateStatus: () => true,
    };
    const startedAt = Date.now();
    const response = await this.client.request(request);
    const durationMs = Date.now() - startedAt;
    const normalized = {
      status: response.status,
      durationMs,
      headers: response.headers as Record<string, string | string[] | undefined>,
      body: response.data,
    };
    const assertions = this.assertionsEngine.evaluate(normalized, step.assertions);
    const extracted = this.extractor.extract(normalized, step.extractions);
    const sensitiveValues = step.extractions
      .filter((definition) => definition.sensitive)
      .map((definition) => extracted[definition.name])
      .filter((value): value is string => typeof value === 'string');
    return {
      status: assertions.every((assertion) => assertion.passed) ? 'SUCCESS' : 'FAILED',
      extracted,
      sensitiveValues,
      request,
      assertions,
      durationMs,
    };
  }
}
