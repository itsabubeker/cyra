import { useState, type FormEvent } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FormAlert } from '@/components/shared/form-alert';
import type { MediaFile, TmdbMovie } from '@/api/types';
import { tmdbErrorMessage } from '@/lib/errors';
import { fileName } from '@/lib/media-file';
import { useManualMatch } from '@/features/files/api';
import { tmdbSearchQuery, type TmdbSearchCriteria } from './api';
import { TmdbMovieOption } from './tmdb-movie-option';

export type MatchableFile = Pick<MediaFile, 'id' | 'relativePath' | 'parsedTitle' | 'parsedYear'>;

interface FixMatchDialogProps {
  file: MatchableFile | null;
  onOpenChange: (open: boolean) => void;
  onMatched?: (updated: MediaFile, movie: TmdbMovie) => void;
}

export function FixMatchDialog({ file, onOpenChange, onMatched }: FixMatchDialogProps) {
  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[700px]">
        {file && (
          <FixMatchContent
            key={file.id}
            file={file}
            onMatched={(updated, movie) => {
              onMatched?.(updated, movie);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface FixMatchContentProps {
  file: MatchableFile;
  onMatched: (updated: MediaFile, movie: TmdbMovie) => void;
}

function FixMatchContent({ file, onMatched }: FixMatchContentProps) {
  const [title, setTitle] = useState(file.parsedTitle);
  const [year, setYear] = useState(file.parsedYear?.toString() ?? '');
  const [criteria, setCriteria] = useState<TmdbSearchCriteria>({
    title: file.parsedTitle,
    year: file.parsedYear ?? undefined,
  });
  const search = useInfiniteQuery({ ...tmdbSearchQuery(criteria), enabled: criteria.title.length > 0 });
  const match = useManualMatch();
  const results = search.data?.pages.flatMap((page) => page.items) ?? [];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim().slice(0, 100);
    const parsedYear = Number(year);
    setCriteria({ title: trimmed, year: Number.isInteger(parsedYear) && parsedYear > 0 ? parsedYear : undefined });
  };

  const select = (movie: TmdbMovie) =>
    match.mutate(
      { fileId: file.id, tmdbId: movie.id, title: movie.title },
      { onSuccess: (updated) => onMatched(updated, movie) },
    );

  return (
    <>
      <div className="flex flex-col gap-1.5 border-b px-7 pt-6 pb-4">
        <p className="eyebrow">Fix match</p>
        <DialogTitle>Which film is this?</DialogTitle>
        <DialogDescription className="font-mono text-xs break-all text-subtle">
          {fileName(file.relativePath)}
        </DialogDescription>
      </div>

      <form
        onSubmit={submit}
        className="grid grid-cols-[minmax(0,1fr)_88px] gap-2.5 px-7 py-4 sm:grid-cols-[minmax(0,1fr)_120px_auto]"
      >
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-[10px] text-subtle">Title</span>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} required />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-[10px] text-subtle">Year</span>
          <Input value={year} onChange={(event) => setYear(event.target.value)} inputMode="numeric" placeholder="Any" />
        </label>
        <Button type="submit" className="col-span-2 h-11 rounded-lg sm:col-span-1 sm:self-end">
          Search TMDB
        </Button>
      </form>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-7 pb-5">
        {search.isLoading && <ResultSkeletons />}
        {search.isError && <FormAlert>{tmdbErrorMessage(search.error)}</FormAlert>}
        {search.isSuccess && (
          <p className="eyebrow pb-1 text-[10px] text-subtle">
            {results.length === 0
              ? 'No results. Try a different title or clear the year.'
              : `${search.data.pages[0].totalResults} results · Click to match`}
          </p>
        )}
        {results.map((movie) => (
          <TmdbMovieOption key={movie.id} movie={movie} disabled={match.isPending} onSelect={select} />
        ))}
        {search.hasNextPage && (
          <Button
            variant="link"
            className="mt-2 self-center"
            disabled={search.isFetchingNextPage}
            onClick={() => search.fetchNextPage()}
          >
            {search.isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        )}
      </div>

      <p className="border-t px-7 py-3.5 text-xs text-subtle">
        Saved as a manual match. Manual matches are never changed by Match to TMDB.
      </p>
    </>
  );
}

function ResultSkeletons() {
  return Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[82px] rounded-lg" />);
}
