import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity.js';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { ListMoviesQueryDto } from './dto/list-movies-query.dto.js';
import { WatchRecord } from './entities/watch-record.entity.js';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movies: Repository<Movie>,
    @InjectRepository(WatchRecord)
    private readonly watchRecords: Repository<WatchRecord>,
  ) {}

  async findAll({
    query: { search, year, size, page },
    userId,
  }: {
    query: ListMoviesQueryDto;
    userId: number;
  }) {
    const where: FindOptionsWhere<Movie> = {};
    if (search) where.title = Like(`%${search}%`);
    if (year) where.year = year;

    const result = await this.movies.findAndCount({
      order: { title: 'ASC', id: 'ASC' },
      where,
      take: size,
      skip: size * (page - 1),
    });

    const movies = result[0];
    if (movies.length === 0) return { items: [], total: result[1] };

    const movieIds = movies.map((item) => item.id);
    const watchRecords = await this.watchRecords.find({
      where: { userId, movieId: In(movieIds) },
      select: { movieId: true },
    });

    const recordSet = new Set(watchRecords.map((r) => r.movieId));

    return {
      items: movies.map((movie) => {
        return {
          id: movie.id,
          tmdbId: movie.tmdbId,
          title: movie.title,
          year: movie.year,
          posterPath: movie.posterPath,
          watched: recordSet.has(movie.id),
        };
      }),
      total: result[1],
    };
  }

  async findOne({ movieId, userId }: { movieId: number; userId: number }) {
    const movie = await this.movies.findOne({
      where: { id: movieId },
      relations: { files: true },
    });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }
    const watched = await this.watchRecords.existsBy({
      userId: userId,
      movieId,
    });

    return {
      id: movie.id,
      tmdbId: movie.tmdbId,
      title: movie.title,
      year: movie.year,
      posterPath: movie.posterPath,
      files: movie.files,
      watched,
    };
  }

  async markWatched({ movieId, userId }: { userId: number; movieId: number }) {
    const movieExists = await this.movies.existsBy({ id: movieId });
    if (!movieExists) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }
    await this.watchRecords.upsert({ userId, movieId }, ['userId', 'movieId']);
  }

  async unmarkWatched({
    movieId,
    userId,
  }: {
    userId: number;
    movieId: number;
  }) {
    await this.watchRecords.delete({ userId, movieId });
  }
}
