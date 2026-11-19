import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersDto } from './dto/list-users.dto.js';
import {
  PaginatedUsersDto,
  UserResponseDto,
} from './dto/users-response.dto.js';
import { Role, User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)
  @ApiBearerAuth()
  async findAll(@Query() query: ListUsersDto): Promise<PaginatedUsersDto> {
    const result = await this.usersService.findAll(query);

    return {
      items: result[0].map(({ id, username, role }) => ({
        id,
        username,
        role,
      })),
      page: query.page,
      size: query.size,
      total: result[1],
    };
  }

  @Post()
  @HttpCode(201)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  async createUser(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(body);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.usersService.deleteUser({
      currentUserId: user.id,
      userId: id,
    });
  }
}
