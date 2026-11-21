import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { FilterChip } from '@/components/shared/filter-chip';
import { fileCountQuery } from '@/features/files/api';
import { useCurrentJob, useStartJob } from '@/features/admin/jobs/api';
import { useIsAdmin } from '@/features/auth/use-current-user';

// Tall enough that the backdrop reads as a scene rather than a strip.
const LIBRARY_EMPTY = 'min-h-[60vh]';

export function EmptyLibrary() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return (
      <EmptyState
        backdrop
        className={LIBRARY_EMPTY}
        eyebrow="0 frames on the reel"
        title="Nothing here yet"
        description="Ask your admin to scan the library."
      />
    );
  }

  return <AdminEmptyLibrary />;
}

function AdminEmptyLibrary() {
  const { data: job } = useCurrentJob();
  const { data: unmatched = 0 } = useQuery(fileCountQuery('unmatched'));
  const startJob = useStartJob();
  const busy = job?.status === 'running' || startJob.isPending;

  if (unmatched > 0) {
    return (
      <EmptyState
        backdrop
        className={LIBRARY_EMPTY}
        eyebrow={`${unmatched} files waiting`}
        title="Your files need matching"
        description="Movies appear here once their files are matched to TMDB."
      >
        <Button size="lg" onClick={() => startJob.mutate('matchall')} disabled={busy}>
          {busy ? 'Working…' : 'Match to TMDB'}
        </Button>
      </EmptyState>
    );
  }

  return (
    <EmptyState
      backdrop
      className={LIBRARY_EMPTY}
      eyebrow="0 frames on the reel"
      title="Your library is empty"
      description="Scan your media folder to get started."
    >
      <Button size="lg" onClick={() => startJob.mutate('scan')} disabled={busy}>
        {busy ? 'Working…' : 'Scan media folder'}
      </Button>
    </EmptyState>
  );
}

interface NoResultsProps {
  search: string;
  year: number | undefined;
  onClearSearch: () => void;
  onClearYear: () => void;
  onClearAll: () => void;
}

export function NoResults({ search, year, onClearSearch, onClearYear, onClearAll }: NoResultsProps) {
  const title = search ? `No movies match ‘${search}’` : `No movies from ${year}`;

  return (
    <EmptyState title={title}>
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {search && <FilterChip label={`“${search}”`} onRemove={onClearSearch} />}
          {year && <FilterChip label={String(year)} onRemove={onClearYear} />}
        </div>
        <Button variant="link" onClick={onClearAll}>
          Clear filters
        </Button>
      </div>
    </EmptyState>
  );
}
