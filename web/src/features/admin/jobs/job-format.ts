import type { Job, JobKind, MatchAllResult, ScanResult } from '@/api/types';

export const JOB_LABELS: Record<JobKind, { name: string; running: string }> = {
  scan: { name: 'Scan', running: 'Scanning' },
  matchall: { name: 'Match', running: 'Matching' },
};

export function scanResult(job: Job | null | undefined): ScanResult | null {
  return job?.kind === 'scan' && job.status === 'completed' ? (job.result as ScanResult) : null;
}

export function matchResult(job: Job | null | undefined): MatchAllResult | null {
  return job?.kind === 'matchall' && job.status === 'completed' ? (job.result as MatchAllResult) : null;
}

export function summarizeScan(result: ScanResult): string {
  return `Found ${result.scannedVideoItemsCount} video files · ${result.currentItemsCount} in library · ${result.removedStaleCount} removed`;
}

export function summarizeMatch(result: MatchAllResult): string {
  return `${result.matched} matched · ${result.unmatched.length} need review · ${result.failed.length} failed`;
}

export function needsReview(result: MatchAllResult | null): boolean {
  return Boolean(result && (result.unmatched.length > 0 || result.failed.length > 0));
}

export function progressLabel(job: Job): string {
  const label = JOB_LABELS[job.kind].running.toUpperCase();
  if (!job.progress) return label;
  const pad = (value: number) => String(value).padStart(3, '0');
  return `${label} ${pad(job.progress.done)}/${pad(job.progress.total)}`;
}

export function progressPercent(job: Job): number | null {
  if (!job.progress || job.progress.total === 0) return null;
  return Math.round((job.progress.done / job.progress.total) * 100);
}
