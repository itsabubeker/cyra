import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import { Role } from '../entities/user.entity.js';

export class UserResponseDto {
  id!: number;
  username!: string;
  role!: Role;
}

export class PaginatedUsersDto extends PaginatedResponseDto {
  @ApiProperty({ type: () => [UserResponseDto] })
  items!: UserResponseDto[];
}
