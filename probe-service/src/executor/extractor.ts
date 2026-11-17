import { Injectable } from '@nestjs/common';
import { JSONPath } from 'jsonpath-plus';
import { ExtractionDefinition } from '../scenario/scenario.types';
import { HttpResponseData } from './executor.types';

@Injectable()
export class Extractor {
  extract(response: HttpResponseData, definitions: ExtractionDefinition[]): Record<string, unknown> {
    return Object.fromEntries(definitions.map((definition) => [definition.name, this.one(response, definition)]));
  }

  private one(response: HttpResponseData, definition: ExtractionDefinition): unknown {
    if (definition.source === 'BODY') return response.body;
    if (definition.source === 'JSON_PATH') {
      const values = JSONPath({
        path: definition.expression!,
        json: response.body as object,
        wrap: true,
        eval: false,
      }) as unknown[];
      return values[0];
    }
    if (definition.source === 'HEADER') return response.headers[definition.expression!.toLowerCase()];
    const cookies = response.headers['set-cookie'];
    const list = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
    const prefix = `${definition.expression}=`;
    const match = list.flatMap((cookie) => cookie.split(';')).map((part) => part.trim()).find((part) => part.startsWith(prefix));
    return match?.slice(prefix.length);
  }
}
