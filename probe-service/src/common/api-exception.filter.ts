import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

interface HttpResponse {
  status(code: number): HttpResponse;
  json(body: unknown): void;
}

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const body = exception.getResponse();
    response.status(exception.getStatus()).json(
      typeof body === 'object' && 'code' in body
        ? body
        : { code: exception.getStatus(), desc: exception.message, data: null },
    );
  }
}
