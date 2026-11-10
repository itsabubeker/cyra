import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class SearchTmdbDto {
  @IsString()
  @Length(1, 100)
  title!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  year?: number;
}
