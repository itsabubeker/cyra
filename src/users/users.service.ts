import {
  ConflictException,
  ForbiddenException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Role, User } from './entities/user.entity.js';
import { hashPassword } from './password.js';
import { ListUsersDto } from './dto/list-users.dto.js';

const normalizeUsername = (username: string) => username.toLowerCase().trim();

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findAll({ page, size, search }: ListUsersDto) {
    const where: FindOptionsWhere<User> = {};
    if (search) where.username = Like(`%${search}%`);

    return this.users.findAndCount({
      order: { username: 'ASC', id: 'ASC' },
      where,
      take: size,
      skip: size * (page - 1),
    });
  }

  async findByUsername(username: string) {
    return this.users.findOneBy({ username: normalizeUsername(username) });
  }
  async findByID(userId: number) {
    return this.users.findOne({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        tokenVersion: true,
      },
    });
  }

  async findForLogin(username: string) {
    const normalizedUsername = normalizeUsername(username);
    return this.users.findOne({
      where: { username: normalizedUsername },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
        tokenVersion: true,
      },
    });
  }

  async count() {
    return this.users.count();
  }

  async createUser({
    username,
    password,
    role,
  }: {
    username: string;
    password: string;
    role: Role;
  }) {
    const normalizedUsername = normalizeUsername(username);
    const existingUser = await this.findByUsername(normalizedUsername);
    if (existingUser) {
      throw new ConflictException('username already exist');
    }

    const passwordHash = await hashPassword(password);

    const newUser = this.users.create({
      username: normalizedUsername,
      passwordHash,
      role,
    });
    const saved = await this.users.save(newUser);
    return { id: saved.id, username: saved.username, role: saved.role };
  }

  async deleteUser({
    currentUserId,
    userId,
  }: {
    userId: number;
    currentUserId: number;
  }) {
    if (userId === currentUserId) {
      throw new ForbiddenException('Deleting own account is not supported');
    }

    const result = await this.users.delete({
      id: userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return;
  }

  async setPassword({
    password,
    userId,
  }: {
    userId: number;
    password: string;
  }) {
    const user = await this.findByID(userId);
    if (!user) throw new NotFoundException('User not found');

    const newPassword = await hashPassword(password);
    user.passwordHash = newPassword;
    user.tokenVersion += 1;

    const updatedUser = await this.users.save(user);

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
    };
  }
}
