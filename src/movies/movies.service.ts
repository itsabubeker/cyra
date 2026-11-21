import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity.js';
import { In, Repository } from 'typeorm';
import { ListMoviesQueryDto } from './dto/list-movies-query.dto.js';
import { MediaFile } from './entities/media-file.entity.js';
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
    const listQuery = this.movies
      .createQueryBuilder('movie')
      .where(
        (qb) =>
          'EXISTS ' +
          qb
            .subQuery()
            .select('1')
            .from(MediaFile, 'file')
            .where('file.movieId = movie.id')
            .getQuery(),
      )
      .orderBy('movie.title', 'ASC')
      .addOrderBy('movie.id', 'ASC')
      .take(size)
      .skip(size * (page - 1));
    if (search)
      listQuery.andWhere('movie.title LIKE :search', { search: `%${search}%` });
    if (year) listQuery.andWhere('movie.year = :year', { year });

    const [movies, total] = await listQuery.getManyAndCount();
    if (movies.length === 0) return { items: [], total };

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
      total,
    };
  }

  async findOne({ movieId, userId }: { movieId: number; userId: number }) {
    const movie = await this.movies.findOne({
      where: { id: movieId },
      relations: { files: true },
    });
    // A movie with no files left is hidden from the list, so hide it here too.
    if (!movie || movie.files.length === 0) {
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
      overview: movie.overview,
      tagline: movie.tagline,
      runtime: movie.runtime,
      backdropPath: movie.backdropPath,
      voteAverage: movie.voteAverage,
      voteCount: movie.voteCount,
      imdbId: movie.imdbId,
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
