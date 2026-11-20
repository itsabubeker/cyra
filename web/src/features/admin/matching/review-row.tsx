import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MediaFile, TmdbMovie, UnmatchedFile } from '@/api/types';
import { useManualMatch } from '@/features/files/api';
import { fileName } from '@/lib/media-file';
import { TmdbMovieOption } from './tmdb-movie-option';

interface ReviewRowProps {
  entry: UnmatchedFile;
  file: MediaFile | undefined;
  matchedTitle: string | undefined;
  onMatched: (relativePath: string, movie: TmdbMovie) => void;
  onSearch: (file: MediaFile) => void;
}

export function ReviewRow({ entry, file, matchedTitle, onMatched, onSearch }: ReviewRowProps) {
  const match = useManualMatch();
  const candidates = entry.candidates ?? [];

  const accept = (movie: TmdbMovie) => {
    if (!file) return;
    match.mutate(
      { fileId: file.id, tmdbId: movie.id, title: movie.title },
      { onSuccess: () => onMatched(entry.relativePath, movie) },
    );
  };

  return (
    <article className="grid gap-4 border-b border-[#1c1c1f] py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-8">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="display text-2xl leading-none">{entry.title}</h3>
        <p className="font-mono text-xs break-all text-subtle" title={entry.relativePath}>
          {fileName(entry.relativePath)}
        </p>
        <p className="text-[13px] text-muted-foreground">{entry.cause}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        {matchedTitle ? (
          <p className="flex items-center gap-2 text-sm text-success">
            <Check className="size-4" /> Matched to {matchedTitle}
          </p>
        ) : !file ? (
          <p className="text-sm text-muted-foreground">This file is no longer unmatched.</p>
        ) : (
          <>
            {candidates.length > 0 && (
              <p className="eyebrow pb-1 text-[10px] text-subtle">Candidates · click to accept</p>
            )}
            {candidates.map((candidate) => (
              <TmdbMovieOption
                key={candidate.id}
                movie={candidate}
                score={candidate.score}
                disabled={match.isPending}
                onSelect={accept}
              />
            ))}
            <Button variant="outline" size="sm" className="mt-1 self-start" onClick={() => onSearch(file)}>
              Search TMDB…
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
