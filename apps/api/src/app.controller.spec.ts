import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { closeDatabase, initializeDatabase, upsertUser } from './db.service';
import { createHmac } from 'node:crypto';

describe('AppController', () => {
  let appController: AppController;

  function ownerHeaders() {
    const email = 'admin@sm365.local';
    const role = 'owner';
    const signature = createHmac(
      'sha256',
      process.env.AUTH_SECRET || 'sm365-dev-secret',
    )
      .update(`${email}:${role}`)
      .digest('base64url');

    return {
      'x-sm365-actor-email': email,
      'x-sm365-actor-role': role,
      'x-sm365-actor-signature': signature,
    };
  }

  beforeEach(async () => {
    await initializeDatabase();
    await upsertUser({
      email: 'admin@sm365.local',
      name: 'SM 365 Admin',
      role: 'owner',
      password: 'sm365-demo',
    });

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return project overview', () => {
      expect(appController.getOverview()).toEqual(
        expect.objectContaining({
          name: 'SM 365 API',
          project: 'SM 365',
        }),
      );
    });
  });

  describe('health', () => {
    it('should return a healthy status payload', () => {
      expect(appController.getHealth()).toEqual(
        expect.objectContaining({
          status: 'ok',
          service: 'api',
          project: 'SM 365',
        }),
      );
    });
  });

  describe('auth', () => {
    it('should return the demo user on valid login', async () => {
      const response = await appController.login({
        email: 'admin@sm365.local',
        password: 'sm365-demo',
      });

      expect(response.user.email).toBe('admin@sm365.local');
      expect(response.user.role).toBe('owner');
    });

    it('should register a new user', async () => {
      const email = `new-${Date.now()}@sm365.local`;
      const response = await appController.register({
        email,
        name: 'New User',
        password: 'new-password',
      });

      expect(response.user.email).toBe(email);
      expect(response.user.role).toBe('member');
    });

    it('should change a user password', async () => {
      const email = `change-${Date.now()}@sm365.local`;
      await appController.register({
        email,
        name: 'Change User',
        password: 'old-password',
      });

      const response = await appController.changePassword({
        email,
        currentPassword: 'old-password',
        newPassword: 'new-password',
      });

      expect(response.user.email).toBe(email);
      const loginResponse = await appController.login({
        email,
        password: 'new-password',
      });

      expect(loginResponse.user.email).toBe(email);
    });

    it('should list registered users for owners', async () => {
      const response = await appController.getUsers(ownerHeaders());
      const firstUser = response.users[0];

      expect(Array.isArray(response.users)).toBe(true);
      expect(response.users.length).toBeGreaterThan(0);
      expect(typeof firstUser?.email).toBe('string');
      expect(typeof firstUser?.role).toBe('string');
    });

    it('should create and list invites for owners', async () => {
      const inviteEmail = `invite-${Date.now()}@sm365.local`;
      const createResponse = await appController.createInvite(
        {
          email: inviteEmail,
          role: 'member',
        },
        ownerHeaders(),
      );

      expect(createResponse.invite.email).toBe(inviteEmail);
      expect(createResponse.invite.status).toBe('pending');

      const listResponse = await appController.getInvites(ownerHeaders());
      expect(Array.isArray(listResponse.invites)).toBe(true);
      expect(
        listResponse.invites.some((invite) => invite.email === inviteEmail),
      ).toBe(true);
    });

    it('should update a user role for owners', async () => {
      const email = `role-${Date.now()}@sm365.local`;

      await appController.register({
        email,
        name: 'Role User',
        password: 'role-password',
      });

      const response = await appController.changeUserRole(
        {
          email,
          role: 'owner',
        },
        ownerHeaders(),
      );

      expect(response.user.email).toBe(email);
      expect(response.user.role).toBe('owner');
    });
  });

  afterAll(() => {
    closeDatabase();
  });
});
