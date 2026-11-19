import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { MoviesService } from './movies.service.js';
import { ListMoviesQueryDto } from './dto/list-movies-query.dto.js';
import {
  MovieDetailDto,
  PaginatedMoviesDto,
} from './dto/movies-response.dto.js';
import { ApiBearerAuth, ApiNotFoundResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiBearerAuth()
  async findAll(
    @Query() query: ListMoviesQueryDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedMoviesDto> {
    const result = await this.moviesService.findAll({
      query,
      userId: user.id,
    });

    return {
      items: result.items,
      page: query.page,
      size: query.size,
      total: result.total,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiNotFoundResponse({
    description: 'No movie with that id',
    type: ErrorResponseDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<MovieDetailDto> {
    return this.moviesService.findOne({ movieId: id, userId: user.id });
  }

  @Put(':id/watched')
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiNotFoundResponse({
    description: 'No movie with that id',
    type: ErrorResponseDto,
  })
  markWatched(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.moviesService.markWatched({ userId: user.id, movieId: id });
  }

  @Delete(':id/watched')
  @ApiBearerAuth()
  @HttpCode(204)
  unmarkWatched(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.moviesService.unmarkWatched({ userId: user.id, movieId: id });
  }
}
