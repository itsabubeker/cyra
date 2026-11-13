export interface TmdbSearchResponse {
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
