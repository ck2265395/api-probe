import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api-exception';
import { SessionStore } from './session.store';

interface HeaderRequest {
  header(name: string): string | undefined;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionStore) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<HeaderRequest>();
    const token = request.header('token');
    if (!token || !(await this.sessions.get(token))) {
      throw new ApiException(1002, '登录已失效', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
