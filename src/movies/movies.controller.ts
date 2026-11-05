import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MoviesService } from './movies.service.js';
import { ListMoviesQueryDto } from './dto/list-movies-query.dto.js';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async findAll(@Query() query: ListMoviesQueryDto) {
    const result = await this.moviesService.findAll(query);

    return {
      items: result[0],
      page: query.page,
      limit: query.limit,
      total: result[1],
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }
}
