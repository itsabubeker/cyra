import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchTmdbDto } from './dto/search-tmdb.dto.js';

export interface TmdbMovie {
  id: number;
  title: string;
  originalTitle: string;
  year: number | null;
  posterPath: string | null;
}
interface TmdbSearchResponse {
  results: {
    id: number;
    title: string;
    original_title: string;
    release_date: string; // '' when unknown
    poster_path: string | null;
  }[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface TmdbMovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  budget: number;
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  release_date: string; // "" when unknown, not null
  revenue: number;
  runtime: number | null;
  softcore: boolean;
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

@Injectable()
export class TmdbClient {
  private readonly token: string;
  private readonly logger = new Logger(TmdbClient.name);
  constructor(config: ConfigService) {
    this.token = config.getOrThrow<string>('TMDB_API_KEY');
  }
  async searchMovie({ title, year, page }: SearchTmdbDto): Promise<{
    items: TmdbMovie[];
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
    if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);

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

  async getMovie(id: number): Promise<TmdbMovie | null> {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (res.status == 404) return null;
    if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);

    const movie = (await res.json()) as TmdbMovieDetails;

    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
      posterPath: movie.poster_path,
    };
  }
}
