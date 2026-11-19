import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Role } from '../../users/entities/user.entity.js';

export class CreateUserDto {
  @IsString()
  @Length(3, 32)
  username!: string;

  @IsString()
  @Length(8, 128)
  password!: string;

  @IsEnum(Role, { message: 'Role must be a valid role (admin,user)' })
  @IsOptional()
  role: Role = Role.User;
}
