import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { request } from '@/api/http';
import type { MatchStatus, MediaFile, Paginated } from '@/api/types';
import { tmdbErrorMessage } from '@/lib/errors';
import { movieKeys } from '@/features/movies/api';

export const FILES_PAGE_SIZE = 20;
const INDEX_PAGE_SIZE = 100;

export const fileKeys = {
  all: ['files'] as const,
  list: (status: MatchStatus | undefined, page: number) => [...fileKeys.all, 'list', { status, page }] as const,
  count: (status?: MatchStatus) => [...fileKeys.all, 'count', status ?? 'all'] as const,
  detail: (fileId: number) => [...fileKeys.all, 'detail', fileId] as const,
  byStatus: (status: MatchStatus) => [...fileKeys.all, 'by-status', status] as const,
};

function fetchFilePage(status: MatchStatus | undefined, page: number, size: number) {
  return request<Paginated<MediaFile>>('/files', { query: { status, page, size } });
}

export const fileListQuery = (status: MatchStatus | undefined, page: number) =>
  queryOptions({
    queryKey: fileKeys.list(status, page),
    queryFn: () => fetchFilePage(status, page, FILES_PAGE_SIZE),
    placeholderData: (previous) => previous,
  });

export const fileCountQuery = (status?: MatchStatus) =>
  queryOptions({
    queryKey: fileKeys.count(status),
    queryFn: async () => (await fetchFilePage(status, 1, 1)).total,
  });

export const fileDetailQuery = (fileId: number) =>
  queryOptions({
    queryKey: fileKeys.detail(fileId),
    queryFn: () => request<MediaFile>(`/files/${fileId}`),
  });

/** Every file with the given status, paged through in batches of 100. */
export const allFilesByStatusQuery = (status: MatchStatus) =>
  queryOptions({
    queryKey: fileKeys.byStatus(status),
    queryFn: async () => {
      const files: MediaFile[] = [];
      for (let page = 1; ; page += 1) {
        const result = await fetchFilePage(status, page, INDEX_PAGE_SIZE);
        files.push(...result.items);
        if (page * INDEX_PAGE_SIZE >= result.total) return files;
      }
    },
  });

interface ManualMatchInput {
  fileId: number;
  tmdbId: number;
  title: string;
}

export function useManualMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, tmdbId }: ManualMatchInput) =>
      request<MediaFile>(`/files/${fileId}/match`, { method: 'PATCH', body: { tmdbId } }),
    onSuccess: (file, { title }) => {
      queryClient.setQueryData(fileKeys.detail(file.id), file);
      void queryClient.invalidateQueries({ queryKey: fileKeys.all });
      void queryClient.invalidateQueries({ queryKey: movieKeys.all });
      toast.success(`Matched to ${title}`);
    },
    onError: (error) => toast.error(tmdbErrorMessage(error)),
  });
}
