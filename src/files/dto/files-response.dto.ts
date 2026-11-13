import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import { MediaFile } from '../../movies/entities/media-file.entity.js';

export class PaginatedMediaFilesDto extends PaginatedResponseDto {
  items!: MediaFile[];
}
