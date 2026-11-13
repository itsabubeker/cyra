import { Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  MatchAllResponseDto,
  SearchTmdbResponseDto,
} from './dto/metadata-response.dto.js';
import { SearchTmdbDto } from './dto/search-tmdb.dto.js';
import { MatcherService } from './matcher.service.js';
import { TmdbClient } from './tmdb.client.js';
import { ApiBadGatewayResponse, ApiOperation } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

@Controller('matcher')
export class MetaDataController {
  constructor(
    private readonly matcherService: MatcherService,
    private readonly tmdbClient: TmdbClient,
  ) {}

  @Post('/matchall')
  @HttpCode(200)
  async matchAll(): Promise<MatchAllResponseDto> {
    return await this.matcherService.matchAll();
  }

  @Get('/search-tmdb')
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
