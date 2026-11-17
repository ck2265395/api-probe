import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MemorySessionStore, SessionStore } from './session.store';
import { SessionGuard } from './session.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AdminService,
    AuthService,
    SessionGuard,
    { provide: SessionStore, useClass: MemorySessionStore },
  ],
  exports: [AdminService, SessionStore],
})
export class AuthModule {}

