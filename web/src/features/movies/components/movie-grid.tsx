import { useEffect, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { MovieListItem } from '@/api/types';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import { useGridKeyboardNav } from '../hooks/use-grid-keyboard-nav';
import { usePlayMovie } from '../hooks/use-play-movie';
import { useToggleWatched } from '../hooks/use-toggle-watched';
import { MovieCard } from './movie-card';

const GRID_CLASSES =
  'grid grid-cols-3 gap-x-1 gap-y-6 px-1 sm:grid-cols-4 md:gap-y-8 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7';

interface MovieGridProps {
  movies: MovieListItem[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function MovieGrid({ movies, hasNextPage, isFetchingNextPage, onLoadMore }: MovieGridProps) {
  const grid = useGridKeyboardNav<HTMLDivElement>();
  const sentinel = useInView<HTMLDivElement>();
  const playMovie = usePlayMovie();
  const { toggle } = useToggleWatched();

  useEffect(() => {
    if (sentinel.inView && hasNextPage && !isFetchingNextPage) onLoadMore();
  }, [sentinel.inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <>
      <div ref={grid.ref} role="group" aria-label="Movies" onKeyDown={grid.onKeyDown} className={GRID_CLASSES}>
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            index={index}
            onPlay={(target) => playMovie(target.id)}
            onToggleWatched={toggle}
          />
        ))}
        {isFetchingNextPage && <MovieCardSkeletons count={6} />}
      </div>
      <div ref={sentinel.ref} aria-hidden className="h-px" />
    </>
  );
}

function MovieCardSkeletons({ count }: { count: number }): ReactNode {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="flex flex-col gap-2.5">
      <Skeleton className="aspect-2/3 rounded-none" />
      <Skeleton className="mx-2.5 h-4 w-3/4" />
      <Skeleton className="mx-2.5 h-3 w-1/3" />
    </div>
  ));
}

export function MovieGridSkeleton({ className }: { className?: string }) {
  return (
    <div role="status" aria-label="Loading movies" className={cn(GRID_CLASSES, className)}>
      <MovieCardSkeletons count={14} />
    </div>
  );
}
