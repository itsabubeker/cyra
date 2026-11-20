import { useEffect, useEffectEvent, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import type { Job } from '@/api/types';
import { paths } from '@/lib/paths';
import { movieKeys } from '@/features/movies/api';
import { fileCountQuery, fileKeys } from '@/features/files/api';
import { useCurrentJob, useStartJob } from './api';
import { JOB_LABELS, matchResult, needsReview, scanResult, summarizeMatch, summarizeScan } from './job-format';

/** Refreshes library data and shows a toast when a running job finishes. */
export function useJobNotifications() {
  const { data: job } = useCurrentJob();
  const previous = useRef<Job | null | undefined>(undefined);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const startJob = useStartJob();

  const onFinished = useEffectEvent(async (finished: Job) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: movieKeys.all }),
      queryClient.invalidateQueries({ queryKey: fileKeys.all }),
    ]);

    if (finished.status === 'failed') {
      toast.error(`${JOB_LABELS[finished.kind].name} failed`, {
        description: finished.error ?? undefined,
        action: { label: 'Retry', onClick: () => startJob.mutate(finished.kind) },
      });
      return;
    }

    const scan = scanResult(finished);
    if (scan) {
      const unmatched = await queryClient.fetchQuery(fileCountQuery('unmatched'));
      toast.success('Scan finished', {
        description: summarizeScan(scan),
        action: unmatched > 0 ? { label: `Match ${unmatched}`, onClick: () => startJob.mutate('matchall') } : undefined,
      });
      return;
    }

    const match = matchResult(finished);
    if (match) {
      toast.success('Matching finished', {
        description: summarizeMatch(match),
        action: needsReview(match) ? { label: 'Review', onClick: () => navigate(paths.admin.review) } : undefined,
      });
    }
  });

  useEffect(() => {
    const before = previous.current;
    previous.current = job;
    if (job && before?.id === job.id && before.status === 'running' && job.status !== 'running') {
      void onFinished(job);
    }
  }, [job]);
}
