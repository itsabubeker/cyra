import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MoviesService } from './movies.service.js';
import { ListMoviesQueryDto } from './dto/list-movies-query.dto.js';
import { PaginatedMoviesDto } from './dto/movies-response.dto.js';
import { ApiNotFoundResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async findAll(
    @Query() query: ListMoviesQueryDto,
  ): Promise<PaginatedMoviesDto> {
    const result = await this.moviesService.findAll(query);

    return {
      items: result[0],
      page: query.page,
      size: query.size,
      total: result[1],
    };
  }

  @Get(':id')
  @ApiNotFoundResponse({
    description: 'No movie with that id',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }
}
