import type { MovieDetail } from '@/api/types';
import { formatCount, formatRating, formatRuntime } from '@/lib/format';
import { imdbUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface MovieMetaProps {
  movie: Pick<MovieDetail, 'year' | 'runtime' | 'voteAverage' | 'voteCount' | 'imdbId'>;
  showVotes?: boolean;
  showImdb?: boolean;
  className?: string;
}

export function MovieMeta({ movie, showVotes = false, showImdb = false, className }: MovieMetaProps) {
  const { year, runtime, voteAverage, voteCount, imdbId } = movie;

  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[13px] tracking-[0.04em] text-soft uppercase',
        className,
      )}
    >
      {year && <li>{year}</li>}
      {runtime ? <li>{formatRuntime(runtime)}</li> : null}
      {voteAverage ? (
        <li>
          <span className="text-amber">{formatRating(voteAverage)}★</span>
          {showVotes && voteCount ? <span> ({formatCount(voteCount)} votes)</span> : null}
        </li>
      ) : null}
      {showImdb && imdbId && (
        <li>
          <a
            href={imdbUrl(imdbId)}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-amber"
          >
            IMDb ↗
          </a>
        </li>
      )}
    </ul>
  );
}
