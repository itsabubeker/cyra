import { Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { JobDto, JobKind } from '../jobs/dto/job.dto.js';
import { JobsService } from '../jobs/jobs.service.js';
import { Role } from '../users/entities/user.entity.js';
import { SearchTmdbResponseDto } from './dto/metadata-response.dto.js';
import { SearchTmdbDto } from './dto/search-tmdb.dto.js';
import { MatcherService } from './matcher.service.js';
import { TmdbClient } from './tmdb.client.js';

@Controller('matcher')
@Roles(Role.Admin)
export class MetaDataController {
  constructor(
    private readonly matcherService: MatcherService,
    private readonly tmdbClient: TmdbClient,
    private readonly jobsService: JobsService,
  ) {}

  @Post('/matchall')
  @ApiBearerAuth()
  @HttpCode(202)
  @ApiConflictResponse({ type: ErrorResponseDto })
  matchAll(): JobDto {
    return this.jobsService.start(JobKind.MatchAll, (report) =>
      this.matcherService.matchAll(report),
    );
  }

  @Get('/search-tmdb')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search TMDB to find the tmdbId for a manual match',
  })
  @ApiBadGatewayResponse({ type: ErrorResponseDto })
  async searchTmdb(
    @Query() query: SearchTmdbDto,
  ): Promise<SearchTmdbResponseDto> {
    return await this.tmdbClient.searchMovie(query);
  }
}
