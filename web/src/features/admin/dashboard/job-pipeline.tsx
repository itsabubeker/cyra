import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import type { Job, JobKind } from '@/api/types';
import { fileCountQuery } from '@/features/files/api';
import { formatRelativeTime } from '@/lib/format';
import { paths } from '@/lib/paths';
import { useCurrentJob, useStartJob } from '../jobs/api';
import { matchResult, needsReview, scanResult, summarizeMatch, summarizeScan } from '../jobs/job-format';
import { JobProgress, PipelineStep } from './pipeline-step';

function stepStatus(job: Job | null | undefined, kind: JobKind): string | null {
  if (!job || job.kind !== kind) return null;
  if (job.status === 'running') return `Running · started ${formatRelativeTime(job.startedAt)}`;
  const finished = job.finishedAt ? formatRelativeTime(job.finishedAt) : '';
  return job.status === 'failed' ? `Failed ${finished}` : `Done ${finished}`;
}

export function JobPipeline() {
  const { data: job } = useCurrentJob();
  const startJob = useStartJob();
  const { data: unmatched = 0 } = useQuery(fileCountQuery('unmatched'));

  const busy = job?.status === 'running' || startJob.isPending;
  const running = (kind: JobKind) => job?.status === 'running' && job.kind === kind;
  const failed = (kind: JobKind) => job?.status === 'failed' && job.kind === kind;
  const scan = scanResult(job);
  const match = matchResult(job);

  return (
    <section aria-label="Library pipeline" className="grid gap-1 px-4 pt-8 md:px-11 lg:grid-cols-3">
      <PipelineStep
        step="01 · Scan"
        title="Scan library"
        status={stepStatus(job, 'scan')}
        active={running('scan')}
        description="Looks through your media folder for new video files and removes entries for files that no longer exist. Extras folders (featurettes, trailers, samples…) are skipped. Scanning only indexes files; it doesn't match them."
      >
        {running('scan') && job && <JobProgress job={job} />}
        {scan && <p className="font-mono text-xs text-soft uppercase">{summarizeScan(scan)}</p>}
        {failed('scan') && <p className="text-sm text-danger">{job?.error}</p>}
        {!running('scan') && (
          <Button variant="outline" className="self-start" disabled={busy} onClick={() => startJob.mutate('scan')}>
            {failed('scan') ? 'Retry scan' : job ? 'Scan again' : 'Scan library'}
          </Button>
        )}
      </PipelineStep>

      <PipelineStep
        step="02 · Match"
        title="Match to TMDB"
        status={stepStatus(job, 'matchall')}
        active={running('matchall')}
        description="Looks up every unmatched file on TMDB. Files that are already matched or were fixed by hand are never touched."
      >
        {running('matchall') && job && <JobProgress job={job} />}
        {match && <p className="font-mono text-xs text-soft uppercase">{summarizeMatch(match)}</p>}
        {failed('matchall') && <p className="text-sm text-danger">{job?.error}</p>}
        {!running('matchall') && (
          <Button
            variant={unmatched > 0 ? 'default' : 'outline'}
            className="self-start"
            disabled={busy || unmatched === 0}
            onClick={() => startJob.mutate('matchall')}
          >
            {failed('matchall') ? 'Retry match' : unmatched > 0 ? `Match ${unmatched} files` : 'Nothing to match'}
          </Button>
        )}
      </PipelineStep>

      <PipelineStep
        step="03 · Review"
        title="Review results"
        status={match ? 'Ready' : 'After match'}
        description="Files TMDB couldn't place with confidence. Pick the right candidate in one click, or search TMDB yourself."
      >
        {needsReview(match) ? (
          <Button asChild className="self-start">
            <Link to={paths.admin.review}>Review last match results</Link>
          </Button>
        ) : (
          <p className="font-mono text-xs text-subtle uppercase">
            {match ? 'Nothing to review. Every file found a match.' : 'Available when matching finishes'}
          </p>
        )}
      </PipelineStep>
    </section>
  );
}
