import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchTmdbDto } from './dto/search-tmdb.dto.js';
import {
  TmdbMovieDetails,
  TmdbSearchResponse,
} from './entities/tmdb.entity.js';
import { TmdbMovieDetailsDto, TmdbMovieDto } from './dto/tmdb-movie.dto.js';

@Injectable()
export class TmdbClient {
  private readonly token: string;
  private readonly logger = new Logger(TmdbClient.name);
  constructor(config: ConfigService) {
    this.token = config.getOrThrow<string>('TMDB_API_KEY');
  }
  async searchMovie({ title, year, page }: SearchTmdbDto): Promise<{
    items: TmdbMovieDto[];
    page: number;
    totalPages: number;
    totalResults: number;
  }> {
    const params = new URLSearchParams({ query: title });
    if (year) params.set('year', String(year));
    if (page) params.set('page', String(page));

    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?${params}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      },
    );
    if (!res.ok) {
      const responseMessage = await res.text();
      this.logger.error(
        `TMDB search failed, ${res.status}: ${responseMessage}`,
      );
      throw new BadGatewayException(`TMDB ${res.status}: ${responseMessage}`);
    }

    const data = (await res.json()) as TmdbSearchResponse;

    return {
      items: data.results.map((r) => ({
        id: r.id,
        title: r.title,
        originalTitle: r.original_title,
        year: r.release_date ? Number(r.release_date.slice(0, 4)) : null,
        posterPath: r.poster_path,
      })),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  }

  async getMovie(id: number): Promise<TmdbMovieDetailsDto | null> {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const responseMessage = await res.text();
      this.logger.error(`TMDB failed, ${res.status}: ${responseMessage}`);
      throw new BadGatewayException(`TMDB ${res.status}: ${responseMessage}`);
    }

    const movie = (await res.json()) as TmdbMovieDetails;

    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
      posterPath: movie.poster_path,
      overview: movie.overview || null,
      tagline: movie.tagline || null,
      runtime: movie.runtime || null,
      backdropPath: movie.backdrop_path,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      imdbId: movie.imdb_id || null,
    };
  }
}
