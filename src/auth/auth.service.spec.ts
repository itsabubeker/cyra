import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Role, User } from '../users/entities/user.entity.js';
import { hashPassword } from '../users/password.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

const PASSWORD = 'correct-password';

describe('AuthService', () => {
  let service: AuthService;
  let passwordHash: string;
  let users: {
    count: ReturnType<typeof vi.fn>;
    findForLogin: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    setPassword: ReturnType<typeof vi.fn>;
  };
  let jwt: { signAsync: ReturnType<typeof vi.fn> };

  // A real hash, so login and changePassword run the real password check.
  beforeAll(async () => {
    passwordHash = await hashPassword(PASSWORD);
  });

  const storedUser = () => ({
    id: 1,
    username: 'admin',
    role: Role.Admin,
    tokenVersion: 3,
    passwordHash,
  });

  beforeEach(async () => {
    users = {
      count: vi.fn(),
      findForLogin: vi.fn(),
      createUser: vi.fn(),
      setPassword: vi.fn(),
    };
    jwt = { signAsync: vi.fn().mockResolvedValue('signed-token') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('setup', () => {
    it('rejects with 409 once a user exists, without creating anyone', async () => {
      users.count.mockResolvedValue(1);

      await expect(
        service.setup({ username: 'admin', password: PASSWORD }),
      ).rejects.toThrow(ConflictException);
      expect(users.createUser).not.toHaveBeenCalled();
    });

    it('creates the first user as an admin', async () => {
      users.count.mockResolvedValue(0);
      users.createUser.mockResolvedValue({
        id: 1,
        username: 'admin',
        role: Role.Admin,
      });

      await service.setup({ username: 'admin', password: PASSWORD });

      expect(users.createUser).toHaveBeenCalledWith({
        username: 'admin',
        password: PASSWORD,
        role: Role.Admin,
      });
    });
  });

  describe('login', () => {
    // Returns the error message so the two failure cases can be compared.
    const loginError = async (password: string) => {
      const error: unknown = await service
        .login({ username: 'admin', password })
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(UnauthorizedException);
      return (error as UnauthorizedException).message;
    };

    it('rejects an unknown user and a wrong password with the same 401', async () => {
      users.findForLogin.mockResolvedValue(null);
      const unknownUser = await loginError(PASSWORD);

      users.findForLogin.mockResolvedValue(storedUser());
      const wrongPassword = await loginError('wrong-password');

      expect(unknownUser).toBe(wrongPassword);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it('signs sub, role and tokenVersion on success', async () => {
      users.findForLogin.mockResolvedValue(storedUser());

      const result = await service.login({
        username: 'admin',
        password: PASSWORD,
      });

      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: 1,
        role: Role.Admin,
        tokenVersion: 3,
      });
      expect(result).toEqual({ accessToken: 'signed-token' });
    });
  });

  describe('changePassword', () => {
    const currentUser = { id: 1, username: 'admin' } as User;

    it('rejects a wrong current password with 403, without changing anything', async () => {
      users.findForLogin.mockResolvedValue(storedUser());

      await expect(
        service.changePassword({
          currentPassword: 'wrong-password',
          newPassword: 'new-password-123',
          currentUser,
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(users.setPassword).not.toHaveBeenCalled();
    });

    it('sets the new password when the current one is right', async () => {
      users.findForLogin.mockResolvedValue(storedUser());

      await service.changePassword({
        currentPassword: PASSWORD,
        newPassword: 'new-password-123',
        currentUser,
      });

      expect(users.setPassword).toHaveBeenCalledWith({
        userId: 1,
        password: 'new-password-123',
      });
    });
  });

  describe('status', () => {
    it('needs setup only while there are no users', async () => {
      users.count.mockResolvedValue(0);
      await expect(service.status()).resolves.toEqual({ needsSetup: true });

      users.count.mockResolvedValue(1);
      await expect(service.status()).resolves.toEqual({ needsSetup: false });
    });
  });
});
