import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api-exception';
import { AdminService } from './admin.service';
import { LoginReq } from './auth.dto';
import { SessionStore } from './session.store';

@Injectable()
export class AuthService {
  constructor(
    private readonly admins: AdminService,
    private readonly sessions: SessionStore,
  ) {}

  async login(input: LoginReq): Promise<{ token: string }> {
    const admin = await this.admins.verify(input.username, input.password);
    if (!admin) throw new ApiException(1001, '用户名或密码错误', HttpStatus.UNAUTHORIZED);
    return { token: await this.sessions.create(admin.id) };
  }
}

