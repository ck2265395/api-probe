import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(code: number, desc: string, status = HttpStatus.BAD_REQUEST) {
    super({ code, desc, data: null }, status);
  }
}

