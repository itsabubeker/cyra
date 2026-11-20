import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { request } from '@/api/http';
import type { MediaFile, TmdbSearchResponse } from '@/api/types';
import { allFilesByStatusQuery } from '@/features/files/api';

export interface TmdbSearchCriteria {
  title: string;
  year?: number;
}

export const tmdbSearchQuery = ({ title, year }: TmdbSearchCriteria) =>
  infiniteQueryOptions({
    queryKey: ['tmdb', 'search', { title, year }],
    queryFn: ({ pageParam }) =>
      request<TmdbSearchResponse>('/matcher/search-tmdb', { query: { title, year, page: pageParam } }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 5 * 60_000,
  });

/**
 * Match results identify unmatched files by `relativePath` only, but matching
 * needs the file id. This indexes every unmatched file by its path.
 */
export const unmatchedFileIndexQuery = () =>
  queryOptions({
    ...allFilesByStatusQuery('unmatched'),
    select: (files: MediaFile[]) => new Map(files.map((file) => [file.relativePath, file])),
  });
