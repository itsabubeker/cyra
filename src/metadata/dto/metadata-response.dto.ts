import { ApiPropertyOptional } from '@nestjs/swagger';
import { TmdbMovieDto } from './tmdb-movie.dto.js';

export class MatchCandidateDto extends TmdbMovieDto {
  score!: number;
}

export class UnmatchedFileDto {
  title!: string;
  relativePath!: string;
  cause!: string;

  @ApiPropertyOptional({ type: () => [MatchCandidateDto] })
  candidates?: MatchCandidateDto[] | undefined;
}

export class FailedFileDto {
  title!: string;
  relativePath!: string;
  cause!: string;
}

export class MatchAllResponseDto {
  total!: number;
  matched!: number;
  unmatched!: UnmatchedFileDto[];
  failed!: FailedFileDto[];
}

export class SearchTmdbResponseDto {
  items!: TmdbMovieDto[];
  page!: number;
  totalPages!: number;
  totalResults!: number;
}
