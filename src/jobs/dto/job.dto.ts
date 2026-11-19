import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ScannerResponseDto } from '../../scanner/dto/scanner-response.dto.js';
import { MatchAllResponseDto } from '../../metadata/dto/metadata-response.dto.js';

export enum JobKind {
  Scan = 'scan',
  MatchAll = 'matchall',
}
export enum JobStatus {
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

export class JobProgressDto {
  done!: number;
  total!: number;
}

export class JobDto {
  id!: string;
  kind!: JobKind;
  status!: JobStatus;
  startedAt!: Date;
  @ApiProperty({ type: Date, nullable: true })
  finishedAt!: Date | null;
  @ApiProperty({ type: () => JobProgressDto, nullable: true })
  progress!: JobProgressDto | null;
  @ApiProperty({ type: String, nullable: true })
  error!: string | null;
  @ApiProperty({
    nullable: true,
    oneOf: [
      { $ref: getSchemaPath(ScannerResponseDto) },
      { $ref: getSchemaPath(MatchAllResponseDto) },
    ],
  })
  result!: ScannerResponseDto | MatchAllResponseDto | null;
}
