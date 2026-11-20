import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Poster } from '@/components/shared/poster';
import type { MediaFile } from '@/api/types';
import { allFilesByStatusQuery, fileDetailQuery } from '@/features/files/api';
import { formatPercent } from '@/lib/format';
import { isLowConfidence, LOW_CONFIDENCE_SCORE } from '@/lib/media-file';
import { FixMatchDialog } from '../matching/fix-match-dialog';

const MAX_ROWS = 6;

export function LowConfidenceMatches() {
  const [fixing, setFixing] = useState<MediaFile | null>(null);
  const { data: matched, isPending } = useQuery(allFilesByStatusQuery('matched'));
  const lowConfidence = (matched ?? [])
    .filter(isLowConfidence)
    .sort((a, b) => (a.matchScore ?? 0) - (b.matchScore ?? 0));

  if (!isPending && lowConfidence.length === 0) return null;

  return (
    <section aria-labelledby="low-confidence-title" className="flex flex-col px-4 pt-8 md:px-11">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
        <h2 id="low-confidence-title" className="display text-3xl">
          Low-confidence matches
        </h2>
        <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
          Score under {formatPercent(LOW_CONFIDENCE_SCORE)} · spot-check
          {lowConfidence.length > MAX_ROWS && ` · showing ${MAX_ROWS} of ${lowConfidence.length}`}
        </p>
      </div>
      {isPending
        ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="my-2 h-14" />)
        : lowConfidence
            .slice(0, MAX_ROWS)
            .map((file) => <LowConfidenceRow key={file.id} file={file} onFix={() => setFixing(file)} />)}
      <FixMatchDialog file={fixing} onOpenChange={(open) => !open && setFixing(null)} />
    </section>
  );
}

function LowConfidenceRow({ file, onFix }: { file: MediaFile; onFix: () => void }) {
  const movie = useQuery(fileDetailQuery(file.id)).data?.movie;

  return (
    <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#1c1c1f] py-3 md:grid-cols-[40px_minmax(0,1.4fr)_minmax(0,1fr)_70px_auto] md:gap-5">
      <Poster
        path={movie?.posterPath ?? null}
        title={movie?.title ?? file.parsedTitle}
        size="w92"
        showFallbackText={false}
        className="w-10"
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{file.parsedTitle}</span>
        <span className="truncate font-mono text-xs text-subtle" title={file.relativePath}>
          {file.relativePath}
        </span>
      </div>
      <span className="display hidden truncate text-xl text-soft md:block">{movie ? `→ ${movie.title}` : ''}</span>
      <span className="hidden font-mono text-[13px] text-amber md:block">{formatPercent(file.matchScore ?? 0)}</span>
      <Button variant="outline" size="sm" onClick={onFix}>
        Fix match…
      </Button>
    </div>
  );
}
