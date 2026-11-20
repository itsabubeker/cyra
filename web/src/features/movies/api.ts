import { infiniteQueryOptions, queryOptions, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import { request } from '@/api/http';
import type { MovieDetail, MovieListItem, Paginated } from '@/api/types';

export interface MovieFilters {
  search?: string;
  year?: number;
}

export const LIBRARY_PAGE_SIZE = 40;

export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (filters: MovieFilters) => [...movieKeys.lists(), filters] as const,
  count: () => [...movieKeys.all, 'count'] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (movieId: number) => [...movieKeys.details(), movieId] as const,
};

type MoviePage = Paginated<MovieListItem>;

export const movieListQuery = (filters: MovieFilters) =>
  infiniteQueryOptions({
    queryKey: movieKeys.list(filters),
    queryFn: ({ pageParam }) =>
      request<MoviePage>('/movies', {
        query: { page: pageParam, size: LIBRARY_PAGE_SIZE, search: filters.search, year: filters.year },
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.size < last.total ? last.page + 1 : undefined),
  });

export const movieCountQuery = () =>
  queryOptions({
    queryKey: movieKeys.count(),
    queryFn: async () => (await request<MoviePage>('/movies', { query: { page: 1, size: 1 } })).total,
  });

export const movieDetailQuery = (movieId: number) =>
  queryOptions({
    queryKey: movieKeys.detail(movieId),
    queryFn: () => request<MovieDetail>(`/movies/${movieId}`),
  });

export function setWatched(movieId: number, watched: boolean) {
  return request<void>(`/movies/${movieId}/watched`, { method: watched ? 'PUT' : 'DELETE' });
}

/** Writes a watched flag into every cached list page and the detail entry for that movie. */
export function updateCachedWatched(queryClient: QueryClient, movieId: number, watched: boolean) {
  queryClient.setQueriesData<InfiniteData<MoviePage>>({ queryKey: movieKeys.lists() }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((movie) => (movie.id === movieId ? { ...movie, watched } : movie)),
          })),
        }
      : data,
  );
  queryClient.setQueryData<MovieDetail>(movieKeys.detail(movieId), (movie) => (movie ? { ...movie, watched } : movie));
}
