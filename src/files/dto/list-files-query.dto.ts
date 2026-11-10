import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { MatchStatus } from '../../movies/entities/media-file.entity.js';

export class ListFilesQueryDto extends PaginationQueryDto {
  @IsEnum(MatchStatus, {
    message: 'Match status must be a valid status (matched,unmatched,manual)',
  })
  @IsOptional()
  status?: MatchStatus;
}
