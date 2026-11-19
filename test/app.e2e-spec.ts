import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

// One app and one in-memory database for the whole file: the tests run in
// order and build on each other (setup -> login -> create user -> ...).
describe('Auth and guards (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;

  const api = () => request(app.getHttpServer());

  const login = async (username: string, password: string) => {
    const res = await api()
      .post('/api/v1/auth/login')
      .send({ username, password })
      .expect(200);
    return (res.body as { accessToken: string }).accessToken;
  };

  beforeAll(async () => {
    // Never touch the real library database. Values already in process.env
    // win over .env, so these also make the test run without a .env file.
    process.env.DB_PATH = ':memory:';
    process.env.JWT_SECRET ??= 'e2e-secret';
    process.env.TMDB_API_KEY ??= 'e2e-unused';
    process.env.MEDIA_DIR ??= 'e2e-unused';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Same setup as main.ts, so routes and validation behave like production.
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health is public', async () => {
    await api().get('/api/v1/health').expect(200, { status: 'Ok' });
  });

  it('reports needsSetup on a fresh install', async () => {
    await api().get('/api/v1/auth/status').expect(200, { needsSetup: true });
  });

  it('rejects a protected route without a token (401)', async () => {
    await api().get('/api/v1/auth/me').expect(401);
  });

  it('rejects a malformed token (401)', async () => {
    await api()
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not-a-jwt')
      .expect(401);
  });

  it('creates the admin once, then refuses setup (409)', async () => {
    await api()
      .post('/api/v1/auth/setup')
      .send({ username: 'admin', password: 'admin-password' })
      .expect(201);

    await api()
      .post('/api/v1/auth/setup')
      .send({ username: 'other', password: 'other-password' })
      .expect(409);
  });

  it('rejects a wrong password (401)', async () => {
    await api()
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'wrong-password' })
      .expect(401);
  });

  it('GET /auth/me returns only id, username and role', async () => {
    adminToken = await login('admin', 'admin-password');

    const res = await api()
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toEqual({ id: 1, username: 'admin', role: 'admin' });
  });

  it('ignores ?token= on routes without @AllowQueryToken (401)', async () => {
    await api().get(`/api/v1/auth/me?token=${adminToken}`).expect(401);
  });

  it('lets an admin create a user', async () => {
    await api()
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'viewer', password: 'viewer-password' })
      .expect(201);

    userToken = await login('viewer', 'viewer-password');
  });

  it('blocks a non-admin from an admin route (403)', async () => {
    await api()
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('lets an admin through the same route (200)', async () => {
    await api()
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('change-password revokes the old token', async () => {
    await api()
      .patch('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        currentPassword: 'viewer-password',
        newPassword: 'viewer-password-2',
      })
      .expect(204);

    await api()
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(401);

    const newToken = await login('viewer', 'viewer-password-2');
    await api()
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${newToken}`)
      .expect(200);
  });
});
