import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  LoginResponseDto,
  StatusResponseDto,
} from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { SetupAdminDto } from './dto/setup-admin.dto.js';
import { Public } from './decorators/public.decorator.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserResponseDto } from '../users/dto/users-response.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('status')
  async status(): Promise<StatusResponseDto> {
    return this.authService.status();
  }

  @Public()
  @Post('setup')
  async setup(@Body() body: SetupAdminDto): Promise<UserResponseDto> {
    return this.authService.setup(body);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }

  @Get('me')
  @ApiBearerAuth()
  async me(@CurrentUser() user: User): Promise<UserResponseDto> {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @HttpCode(204)
  async changePassword(
    @Body() body: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    return this.authService.changePassword({
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      currentUser: user,
    });
  }
}
