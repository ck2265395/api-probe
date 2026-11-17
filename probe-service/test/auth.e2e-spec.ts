import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { AdminService } from '../src/auth/admin.service';

describe('administrator authentication', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const admins = app.get(AdminService);
    await admins.create({ username: 'probe-admin', password: 'correct-password' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a token for valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/login')
      .send({ username: 'probe-admin', password: 'correct-password' })
      .expect(201);

    expect(response.body).toEqual({
      code: 0,
      desc: 'success',
      data: { token: expect.any(String) },
    });
  });

  it('rejects an incorrect password without exposing account details', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/login')
      .send({ username: 'probe-admin', password: 'wrong-password' })
      .expect(401);

    expect(response.body).toEqual({
      code: 1001,
      desc: '用户名或密码错误',
      data: null,
    });
  });

  it('rejects a guarded route when the token header is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/admin/session')
      .expect(401);

    expect(response.body).toEqual({
      code: 1002,
      desc: '登录已失效',
      data: null,
    });
  });
});
