import { Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { MatcherService } from './matcher.service.js';
import { SearchTmdbDto } from './dto/search-tmdb.dto.js';
import { TmdbClient } from './tmdb.client.js';

@Controller('matcher')
export class MetaDataController {
  constructor(
    private readonly matcherService: MatcherService,
    private readonly tmdbClient: TmdbClient,
  ) {}

  @Post('/matchall')
  @HttpCode(200)
  async matchAll() {
    return await this.matcherService.matchAll();
  }

  @Get('/search-tmdb')
  async searchTmdb(@Query() query: SearchTmdbDto) {
    return await this.tmdbClient.searchMovie(query);
  }
}
