import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import { Movie } from '../entities/movie.entity.js';

export class PaginatedMoviesDto extends PaginatedResponseDto {
  items!: Movie[];
}
