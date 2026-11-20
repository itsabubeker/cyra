import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { MediaFile, TmdbMovie } from '@/api/types';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { fileName } from '@/lib/media-file';
import { paths } from '@/lib/paths';
import { AdminPageHeader } from '../admin-layout';
import { useCurrentJob } from '../jobs/api';
import { matchResult, summarizeMatch } from '../jobs/job-format';
import { unmatchedFileIndexQuery } from './api';
import { FixMatchDialog } from './fix-match-dialog';
import { ReviewRow } from './review-row';

export function ReviewPage() {
  useDocumentTitle('Review matches');
  const { data: job, isPending } = useCurrentJob();
  const result = matchResult(job);
  const index = useQuery({ ...unmatchedFileIndexQuery(), enabled: result !== null });
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [searching, setSearching] = useState<MediaFile | null>(null);

  const markMatched = (relativePath: string, movie: TmdbMovie) =>
    setMatched((current) => ({ ...current, [relativePath]: movie.title }));

  if (isPending) return <Skeleton className="mx-4 mt-8 h-64 md:mx-11" />;

  if (!result) {
    return (
      <EmptyState
        title="No match results to review"
        description="Results from the last Match to TMDB run show up here until the next job starts."
      >
        <Button asChild>
          <Link to={paths.admin.dashboard}>Back to dashboard</Link>
        </Button>
      </EmptyState>
    );
  }

  return (
    <>
      <AdminPageHeader title="Review matches">
        <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">{summarizeMatch(result)}</p>
      </AdminPageHeader>

      <section aria-labelledby="needs-review" className="mx-4 mt-8 md:mx-11">
        <h2 id="needs-review" className="eyebrow border-b pb-3">
          Needs review · {result.unmatched.length}
        </h2>
        {result.unmatched.length === 0 && <p className="py-6 text-sm text-muted-foreground">Nothing needs review.</p>}
        {index.isPending
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="my-4 h-28" />)
          : result.unmatched.map((entry) => (
              <ReviewRow
                key={entry.relativePath}
                entry={entry}
                file={index.data?.get(entry.relativePath)}
                matchedTitle={matched[entry.relativePath]}
                onMatched={markMatched}
                onSearch={setSearching}
              />
            ))}
      </section>

      {result.failed.length > 0 && (
        <section aria-labelledby="failed" className="mx-4 mt-10 md:mx-11">
          <h2 id="failed" className="eyebrow border-b pb-3 text-danger">
            Failed · {result.failed.length} · retried on the next run
          </h2>
          {result.failed.map((entry) => (
            <div key={entry.relativePath} className="flex flex-col gap-1 border-b border-[#1c1c1f] py-4">
              <span className="font-mono text-xs break-all">{fileName(entry.relativePath)}</span>
              <span className="text-[13px] text-danger">{entry.cause}</span>
            </div>
          ))}
        </section>
      )}

      <FixMatchDialog
        file={searching}
        onOpenChange={(open) => !open && setSearching(null)}
        onMatched={(file, movie) => markMatched(file.relativePath, movie)}
      />
    </>
  );
}
