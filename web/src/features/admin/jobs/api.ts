import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isApiError, request } from '@/api/http';
import type { Job, JobKind } from '@/api/types';
import { errorMessage } from '@/lib/errors';
import { JOB_LABELS } from './job-format';

const POLL_INTERVAL_MS = 1000;

const START_PATHS: Record<JobKind, string> = {
  scan: '/scanner',
  matchall: '/matcher/matchall',
};

export const currentJobQuery = () =>
  queryOptions({
    queryKey: ['jobs', 'current'],
    queryFn: async (): Promise<Job | null> => {
      try {
        return await request<Job>('/jobs/current');
      } catch (error) {
        if (isApiError(error, 404)) return null;
        throw error;
      }
    },
    staleTime: 0,
    refetchInterval: (query) => (query.state.data?.status === 'running' ? POLL_INTERVAL_MS : false),
  });

/** The server's most recent job. Polls every second while one is running. */
export function useCurrentJob(enabled = true) {
  return useQuery({ ...currentJobQuery(), enabled });
}

export function useStartJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (kind: JobKind) => request<Job>(START_PATHS[kind], { method: 'POST' }),
    onSuccess: (job) => queryClient.setQueryData(currentJobQuery().queryKey, job),
    onError: async (error) => {
      if (!isApiError(error, 409)) {
        toast.error(errorMessage(error));
        return;
      }
      const running = await queryClient.fetchQuery(currentJobQuery());
      if (running) toast.info(`${JOB_LABELS[running.kind].running} already…`);
    },
  });
}
