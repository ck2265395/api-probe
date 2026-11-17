import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { success } from '../common/response';
import { AuthService } from './auth.service';
import { LoginReq } from './auth.dto';
import { SessionGuard } from './session.guard';

@Controller('api/v1/admin')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() input: LoginReq) {
    return success(await this.auth.login(input));
  }

  @Get('session')
  @UseGuards(SessionGuard)
  session() {
    return success({ authenticated: true });
  }
}

