import { Link } from 'react-router';
import { Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Poster } from '@/components/shared/poster';
import type { MovieListItem } from '@/api/types';
import { formatFrameNumber } from '@/lib/format';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: MovieListItem;
  index: number;
  onPlay: (movie: MovieListItem) => void;
  onToggleWatched: (movie: MovieListItem) => void;
}

export function MovieCard({ movie, index, onPlay, onToggleWatched }: MovieCardProps) {
  const { title, year, posterPath, watched } = movie;

  return (
    <article className="group flex flex-col gap-2.5">
      <div className="relative">
        <Link
          to={paths.movie(movie.id)}
          data-grid-item
          aria-label={`${title}${year ? ` (${year})` : ''}${watched ? ', watched' : ''}`}
          className="block outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber"
        >
          <Poster
            path={posterPath}
            title={title}
            year={year}
            size="w342"
            dimmed={watched}
            imageClassName="group-hover:scale-[1.04]"
          />
        </Link>

        {watched && (
          <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-sm bg-background/75 px-1.5 py-1 font-mono text-[10px] tracking-widest">
            ✓ SEEN
          </span>
        )}

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex gap-2 bg-linear-to-t from-background/95 via-background/60 to-transparent p-3 pt-12 opacity-0 transition-opacity',
            'group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:hidden',
          )}
        >
          <Button size="sm" className="flex-1" onClick={() => onPlay(movie)} aria-label={`Play ${title}`}>
            <Play className="fill-current" /> Play
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label={watched ? `Mark ${title} as not watched` : `Mark ${title} as watched`}
            aria-pressed={watched}
            onClick={() => onToggleWatched(movie)}
            className={cn('bg-background/40', watched && 'border-amber text-amber')}
          >
            <Check />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-2.5">
        <h3 className={cn('truncate text-[15px] font-medium', watched && 'text-subtle')}>{title}</h3>
        <p className="flex gap-2.5 font-mono text-[11px] text-subtle">
          <span>{formatFrameNumber(index)}</span>
          {year && <span>{year}</span>}
        </p>
      </div>
    </article>
  );
}
