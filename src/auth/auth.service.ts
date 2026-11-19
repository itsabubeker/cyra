import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '../users/entities/user.entity.js';
import { hashPassword, verifyPassword } from '../users/password.js';
import { UsersService } from '../users/users.service.js';
import { LoginResponseDto } from './dto/auth-response.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { SetupAdminDto } from './dto/setup-admin.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async setup({ username, password }: SetupAdminDto) {
    const usersCount = await this.usersService.count();
    if (usersCount > 0) {
      throw new ConflictException('Setup already completed');
    }

    return this.usersService.createUser({
      username,
      password,
      role: Role.Admin,
    });
  }

  private dummyHash?: Promise<string>;

  async login({ username, password }: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findForLogin(username);

    this.dummyHash ??= hashPassword('dummy-password-for-timing');
    const passwordHash = user?.passwordHash ?? (await this.dummyHash);

    const valid = await verifyPassword({ plain: password, passwordHash });
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });
    return { accessToken };
  }

  async changePassword({
    currentPassword,
    newPassword,
    currentUser,
  }: ChangePasswordDto & { currentUser: User }) {
    const user = await this.usersService.findForLogin(currentUser.username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const valid = await verifyPassword({
      plain: currentPassword,
      passwordHash: user.passwordHash,
    });

    if (!valid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    await this.usersService.setPassword({
      userId: user.id,
      password: newPassword,
    });
  }

  async status() {
    const usersCount = await this.usersService.count();

    return {
      needsSetup: usersCount < 1,
    };
  }
}
