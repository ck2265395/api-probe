import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';

@Injectable()
export class TemplateRenderer {
  render<T>(value: T, context: Record<string, unknown>): T {
    if (typeof value === 'string') {
      return Handlebars.compile(value, { noEscape: true, strict: true })(context, {
        allowProtoMethodsByDefault: false,
        allowProtoPropertiesByDefault: false,
      }) as T;
    }
    if (Array.isArray(value)) return value.map((item) => this.render(item, context)) as T;
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, this.render(child, context)])) as T;
    }
    return value;
  }
}

