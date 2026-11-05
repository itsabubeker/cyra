import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
}

@Injectable()
export class TmdbClient {
  private readonly token: string;
  private readonly logger = new Logger(TmdbClient.name);
  constructor(config: ConfigService) {
    this.token = config.getOrThrow<string>('TMDB_API_KEY');
  }
  async searchMovie(title: string, year?: number | null): Promise<TmdbMovie[]> {
    const params = new URLSearchParams({ query: title });
    if (year) params.set('year', String(year));

    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?${params}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      },
    );
    if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);

    const data = (await res.json()) as TmdbSearchResponse;

    return data.results.map((r) => ({
      id: r.id,
      title: r.title,
      originalTitle: r.original_title,
      year: r.release_date ? Number(r.release_date.slice(0, 4)) : null,
      posterPath: r.poster_path,
    }));
  }
}
