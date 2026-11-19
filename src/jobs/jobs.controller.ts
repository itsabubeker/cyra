import { Controller, Get, NotFoundException } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/entities/user.entity.js';
import { JobsService } from './jobs.service.js';
import { ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { ScannerResponseDto } from '../scanner/dto/scanner-response.dto.js';
import { MatchAllResponseDto } from '../metadata/dto/metadata-response.dto.js';
import { JobDto } from './dto/job.dto.js';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('current')
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiExtraModels(ScannerResponseDto, MatchAllResponseDto)
  current(): JobDto {
    const currentJob = this.jobsService.getCurrent();
    if (!currentJob) {
      throw new NotFoundException('No current job');
    }
    return currentJob;
  }
}
