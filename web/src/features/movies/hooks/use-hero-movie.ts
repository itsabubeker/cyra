import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { MovieListItem } from '@/api/types';
import { movieDetailQuery } from '../api';

const CANDIDATE_COUNT = 3;

function pickCandidates(movies: MovieListItem[], seed: number): MovieListItem[] {
  const unwatched = movies.filter((movie) => !movie.watched);
  const pool = unwatched.length > 0 ? unwatched : movies;
  const start = Math.floor(seed * pool.length);
  return Array.from({ length: Math.min(CANDIDATE_COUNT, pool.length) }, (_, i) => pool[(start + i) % pool.length]);
}

/**
 * Picks a few movies from the loaded page (unwatched first), loads their details
 * and returns the first one that has a backdrop for the hero banner.
 */
export function useHeroMovie(movies: MovieListItem[] | undefined, enabled: boolean) {
  const [seed] = useState(Math.random);
  const candidates = enabled && movies ? pickCandidates(movies, seed) : [];

  return useQueries({
    queries: candidates.map((movie) => movieDetailQuery(movie.id)),
    combine: (results) => {
      const firstWithBackdrop = results.findIndex((result) => result.data?.backdropPath);
      const decided = firstWithBackdrop !== -1 && results.slice(0, firstWithBackdrop).every((r) => !r.isPending);
      if (decided) return { movie: results[firstWithBackdrop].data, isLoading: false };
      return { movie: undefined, isLoading: results.some((result) => result.isPending) };
    },
  });
}
