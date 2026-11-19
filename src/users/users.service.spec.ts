import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role, User } from './entities/user.entity.js';
import { verifyPassword } from './password.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let users: {
    findOne: ReturnType<typeof vi.fn>;
    findOneBy: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    users = {
      findOne: vi.fn().mockResolvedValue(null),
      findOneBy: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      // create() only builds an object in memory
      create: vi.fn().mockImplementation((u: Partial<User>) => ({ ...u })),
      // save() assigns an id, like the database would
      save: vi
        .fn()
        .mockImplementation((u: Partial<User>) =>
          Promise.resolve({ id: 1, ...u }),
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: users },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('createUser', () => {
    it('saves the user (create alone does not persist)', async () => {
      await service.createUser({
        username: 'root',
        password: 'hunter2',
        role: Role.Admin,
      });

      expect(users.save).toHaveBeenCalledTimes(1);
    });

    it('lowercases and trims the username', async () => {
      await service.createUser({
        username: '  Root ',
        password: 'hunter2',
        role: Role.Admin,
      });

      expect(users.save).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'root' }),
      );
    });

    it('stores a hash that verifies, never the plain password', async () => {
      await service.createUser({
        username: 'root',
        password: 'hunter2',
        role: Role.Admin,
      });

      const [saved] = users.save.mock.calls[0] as [User];
      expect(saved.passwordHash).not.toBe('hunter2');
      await expect(
        verifyPassword({ plain: 'hunter2', passwordHash: saved.passwordHash }),
      ).resolves.toBe(true);
    });

    it('stores the given role', async () => {
      await service.createUser({
        username: 'alice',
        password: 'hunter2',
        role: Role.User,
      });

      expect(users.save).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.User }),
      );
    });

    it('returns only id, username and role', async () => {
      const result = await service.createUser({
        username: 'root',
        password: 'hunter2',
        role: Role.Admin,
      });

      expect(result).toEqual({ id: 1, username: 'root', role: Role.Admin });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws ConflictException and saves nothing for a duplicate username', async () => {
      users.findOneBy.mockResolvedValue({ id: 5, username: 'root' });

      await expect(
        service.createUser({
          username: 'root',
          password: 'hunter2',
          role: Role.Admin,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(users.save).not.toHaveBeenCalled();
    });

    it('checks for duplicates using the normalized username', async () => {
      await service.createUser({
        username: '  Root ',
        password: 'hunter2',
        role: Role.Admin,
      });

      expect(users.findOneBy).toHaveBeenCalledWith({ username: 'root' });
    });
  });

  describe('findByUsername', () => {
    it('normalizes the username before looking it up', async () => {
      await service.findByUsername(' ALICE ');

      expect(users.findOneBy).toHaveBeenCalledWith({ username: 'alice' });
    });
  });

  describe('findForLogin', () => {
    it('normalizes the username and explicitly selects the hash', async () => {
      await service.findForLogin(' ALICE ');

      expect(users.findOne).toHaveBeenCalledWith({
        where: { username: 'alice' },
        select: expect.objectContaining({
          id: true,
          username: true,
          role: true,
          passwordHash: true,
        }),
      });
    });

    it('returns null for an unknown user', async () => {
      await expect(service.findForLogin('nobody')).resolves.toBeNull();
    });
  });

  describe('count', () => {
    it('returns the number of users', async () => {
      users.count.mockResolvedValue(3);

      await expect(service.count()).resolves.toBe(3);
    });
  });
});
