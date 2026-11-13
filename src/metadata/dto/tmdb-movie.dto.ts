import { ApiProperty } from '@nestjs/swagger';

export class TmdbMovieDto {
  id!: number;
  title!: string;
  originalTitle!: string;
  @ApiProperty({ type: Number, nullable: true })
  year: number | null;
  @ApiProperty({ type: String, nullable: true })
  posterPath: string | null;
}
