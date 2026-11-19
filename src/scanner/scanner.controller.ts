import { Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiConflictResponse } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { JobDto, JobKind } from '../jobs/dto/job.dto.js';
import { JobsService } from '../jobs/jobs.service.js';
import { Role } from '../users/entities/user.entity.js';
import { ScannerService } from './scanner.service.js';

@Controller('scanner')
export class ScannerController {
  constructor(
    private readonly scannerService: ScannerService,
    private readonly jobsService: JobsService,
  ) {}

  @Post()
  @HttpCode(202)
  @ApiBearerAuth()
  @ApiConflictResponse({ type: ErrorResponseDto })
  @Roles(Role.Admin)
  scan(): JobDto {
    return this.jobsService.start(JobKind.Scan, () =>
      this.scannerService.scan(),
    );
  }
}
