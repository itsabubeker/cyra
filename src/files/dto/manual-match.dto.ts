import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ManualMatchDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tmdbId!: number;
}
