import { Poster } from '@/components/shared/poster';
import type { TmdbMovie } from '@/api/types';
import { formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

interface TmdbMovieOptionProps {
  movie: TmdbMovie;
  score?: number;
  disabled?: boolean;
  onSelect: (movie: TmdbMovie) => void;
}

export function TmdbMovieOption({ movie, score, disabled, onSelect }: TmdbMovieOptionProps) {
  const showOriginal = movie.originalTitle && movie.originalTitle !== movie.title;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(movie)}
      className={cn(
        'group grid w-full cursor-pointer grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-lg border border-border py-2 pr-3 pl-2 text-left outline-none transition-colors',
        'hover:border-amber hover:bg-amber-surface focus-visible:border-amber focus-visible:bg-amber-surface disabled:cursor-wait disabled:opacity-60',
      )}
    >
      <Poster path={movie.posterPath} title={movie.title} size="w92" showFallbackText={false} className="w-11" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="display truncate text-[22px] leading-none">{movie.title}</span>
        <span className="truncate font-mono text-[11px] text-muted-foreground">
          {movie.year ?? 'Year unknown'}
          {showOriginal && ` · ${movie.originalTitle}`}
        </span>
      </span>
      <span className="font-mono text-[11px] text-muted-foreground group-hover:text-amber">
        {score !== undefined ? formatPercent(score) : 'MATCH →'}
      </span>
    </button>
  );
}
