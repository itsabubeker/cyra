import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class ListUsersDto extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  search?: string;
}
