import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import { MediaFile } from '../entities/media-file.entity.js';

export class MovieListItemDto {
  id!: number;

  tmdbId!: number;

  title!: string;

  @ApiProperty({ type: Number, nullable: true })
  year!: number | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'TMDB image path, e.g. /abc.jpg (not a full URL). Build the URL as https://image.tmdb.org/t/p/{size}{posterPath}; w342 for grids, w780 for the movie page',
  })
  posterPath!: string | null;

  watched!: boolean;
}
export class PaginatedMoviesDto extends PaginatedResponseDto {
  @ApiProperty({ type: () => [MovieListItemDto] })
  items!: MovieListItemDto[];
}

export class MovieDetailDto extends MovieListItemDto {
  @ApiProperty({ type: () => [MediaFile] })
  files!: MediaFile[];
}
