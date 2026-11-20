import type { MatchStatus, MediaFile } from '@/api/types';
import { formatPercent } from '@/lib/format';
import { isLowConfidence } from '@/lib/media-file';
import { cn } from '@/lib/utils';

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  matched: 'Matched',
  manual: 'Manual',
  unmatched: 'Unmatched',
};

export const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  matched: 'text-success',
  manual: 'text-info',
  unmatched: 'text-danger',
};

type MatchInfo = Pick<MediaFile, 'matchStatus' | 'matchScore'>;

export function MatchStatusLabel({ file, className }: { file: MatchInfo; className?: string }) {
  return (
    <span
      className={cn(
        'font-mono text-[11px] tracking-[0.06em] whitespace-nowrap uppercase',
        MATCH_STATUS_COLORS[file.matchStatus],
        className,
      )}
    >
      ● {MATCH_STATUS_LABELS[file.matchStatus]}
    </span>
  );
}

/** Score as a percentage for auto matches, "—" for manual ones, nothing for unmatched files. */
export function MatchScore({ file, className }: { file: MatchInfo; className?: string }) {
  if (file.matchStatus === 'unmatched') return null;
  const low = isLowConfidence(file);

  return (
    <span className={cn('font-mono text-xs', low ? 'text-amber' : 'text-body', className)}>
      {file.matchScore === null ? '—' : formatPercent(file.matchScore)}
      {low && <span className="sr-only"> (low confidence)</span>}
    </span>
  );
}

export function MatchSummary({ file }: { file: MatchInfo }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-[13px] whitespace-nowrap">
      <span className={MATCH_STATUS_COLORS[file.matchStatus]}>{MATCH_STATUS_LABELS[file.matchStatus]}</span>
      {file.matchScore !== null && <span className="text-muted-foreground">· {formatPercent(file.matchScore)}</span>}
      {isLowConfidence(file) && <span className="text-amber">· check</span>}
    </span>
  );
}
