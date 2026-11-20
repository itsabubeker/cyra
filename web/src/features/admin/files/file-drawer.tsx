import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailList } from '@/components/shared/detail-list';
import { ErrorState } from '@/components/shared/error-state';
import { Poster } from '@/components/shared/poster';
import type { MediaFile, Movie } from '@/api/types';
import { fileDetailQuery } from '@/features/files/api';
import { formatBytes, formatRuntime } from '@/lib/format';
import { paths } from '@/lib/paths';
import { MatchSummary } from './match-status';

interface FileDrawerProps {
  fileId: number | undefined;
  onClose: () => void;
  onFixMatch: (file: MediaFile) => void;
}

export function FileDrawer({ fileId, onClose, onFixMatch }: FileDrawerProps) {
  return (
    <Sheet open={fileId !== undefined} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-5 border-input p-7 sm:max-w-[420px]">
        {fileId !== undefined && <FileDrawerContent fileId={fileId} onFixMatch={onFixMatch} />}
      </SheetContent>
    </Sheet>
  );
}

function FileDrawerContent({ fileId, onFixMatch }: { fileId: number; onFixMatch: (file: MediaFile) => void }) {
  const query = useQuery(fileDetailQuery(fileId));

  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (query.isPending) {
    return (
      <div role="status" aria-label="Loading file" className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const file = query.data;

  return (
    <>
      <p className="eyebrow">File #{file.id}</p>
      <SheetTitle className="font-mono text-[13px] font-medium break-all not-italic">{file.relativePath}</SheetTitle>
      <SheetDescription className="sr-only">File details and linked movie</SheetDescription>
      <DetailList
        items={[
          { label: 'Parsed', value: `${file.parsedTitle}${file.parsedYear ? ` · ${file.parsedYear}` : ''}` },
          { label: 'Size', value: formatBytes(file.sizeBytes) },
          { label: 'Status', value: <MatchSummary file={file} /> },
        ]}
      />
      {file.movie ? (
        <LinkedMovie movie={file.movie} />
      ) : (
        <p className="text-sm text-muted-foreground">Not linked to a movie yet.</p>
      )}
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => onFixMatch(file)}>
          {file.matchStatus === 'unmatched' ? 'Match manually…' : 'Fix match…'}
        </Button>
        <Button variant="outline" asChild>
          <Link to={paths.watch(file.id)}>
            <Play className="fill-current" /> Play file
          </Link>
        </Button>
      </div>
      <p className="mt-auto text-xs leading-normal text-subtle">
        There's no unmatch. To fix a wrong match, match the file to the right movie.
      </p>
    </>
  );
}

function LinkedMovie({ movie }: { movie: Movie }) {
  return (
    <div className="flex gap-4 rounded-lg border bg-card p-3.5">
      <Poster
        path={movie.posterPath}
        title={movie.title}
        size="w92"
        showFallbackText={false}
        className="w-[72px] shrink-0"
      />
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="eyebrow text-[10px] text-subtle">Linked movie</p>
        <p className="display text-[28px] leading-none">{movie.title}</p>
        <p className="font-mono text-[11px] text-muted-foreground">
          {[movie.year, movie.runtime ? formatRuntime(movie.runtime) : null].filter(Boolean).join(' · ')}
        </p>
        <Link to={paths.movie(movie.id)} className="text-xs font-medium underline underline-offset-4 hover:text-amber">
          Open movie page
        </Link>
      </div>
    </div>
  );
}
