import { MediaFile } from '../../movies/entities/media-file.entity.js';

export class PaginatedMediaFiles {
  items: MediaFile[];
  page: number;
  limit: number;
  total: number;
}
