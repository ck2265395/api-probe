import { Injectable } from '@nestjs/common';
import { JSONPath } from 'jsonpath-plus';
import { AssertionDefinition } from '../scenario/scenario.types';
import { AssertionResult, HttpResponseData } from './executor.types';

@Injectable()
export class AssertionEngine {
  evaluate(response: HttpResponseData, assertions: AssertionDefinition[]): AssertionResult[] {
    return assertions.map((assertion) => {
      const actual = this.actual(response, assertion);
      const passed = this.compare(actual, assertion.operator, assertion.expected);
      return { passed, message: passed ? '断言通过' : '断言失败', actual, expected: assertion.expected };
    });
  }

  private actual(response: HttpResponseData, assertion: AssertionDefinition): unknown {
    if (assertion.type === 'STATUS') return response.status;
    if (assertion.type === 'DURATION') return response.durationMs;
    if (assertion.type === 'HEADER') return response.headers[assertion.expression!.toLowerCase()];
    const values = JSONPath({
      path: assertion.expression!,
      json: response.body as object,
      wrap: true,
      eval: false,
    }) as unknown[];
    return values[0];
  }

  private compare(actual: unknown, operator: AssertionDefinition['operator'], expected: unknown): boolean {
    if (operator === 'EQUALS') return actual === expected;
    if (operator === 'NOT_EQUALS') return actual !== expected;
    if (operator === 'EXISTS') return actual !== undefined && actual !== null;
    if (operator === 'NOT_EXISTS') return actual === undefined || actual === null;
    if (operator === 'LESS_THAN') return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
    return typeof actual === 'string' && actual.includes(String(expected));
  }
}
