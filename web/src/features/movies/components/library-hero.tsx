import { Link } from 'react-router';
import { Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Backdrop } from '@/components/shared/backdrop';
import { MovieTitle } from '@/components/shared/movie-title';
import type { MovieDetail } from '@/api/types';
import { paths } from '@/lib/paths';
import { usePlayMovie } from '../hooks/use-play-movie';
import { useToggleWatched } from '../hooks/use-toggle-watched';
import { MovieMeta } from './movie-meta';

interface LibraryHeroProps {
  movie: MovieDetail;
}

export function LibraryHero({ movie }: LibraryHeroProps) {
  const playMovie = usePlayMovie();
  const { toggle } = useToggleWatched();

  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[max(460px,min(78vh,640px))] items-end pt-(--nav-height)"
    >
      <Backdrop path={movie.backdropPath} fade="hero" />
      <div className="relative flex w-full max-w-3xl min-w-0 flex-col gap-4 px-5 pb-10 md:px-11 md:pb-14">
        <p className="eyebrow text-amber">Now showing{movie.watched ? '' : ' · Not yet seen'}</p>
        <MovieTitle id="hero-title" title={movie.title} variant="hero" className="line-clamp-3 pb-1" />
        {movie.tagline && (
          <p className="max-w-xl font-serif text-xl leading-snug text-soft md:text-[22px]">{movie.tagline}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={() => playMovie(movie.id)} disabled={movie.files.length === 0}>
            <Play className="fill-current" /> Play
          </Button>
          <Button size="lg" variant="outline" asChild className="text-sm font-medium">
            <Link to={paths.movie(movie.id)}>Details</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="hidden text-sm font-medium sm:inline-flex"
            aria-pressed={movie.watched}
            onClick={() => toggle(movie)}
          >
            {movie.watched && <Check />}
            {movie.watched ? 'Watched' : 'Mark watched'}
          </Button>
          <MovieMeta movie={movie} className="text-xs text-muted-foreground sm:ml-2" />
        </div>
      </div>
    </section>
  );
}

export function LibraryHeroPlaceholder() {
  return (
    <div aria-hidden className="relative min-h-[max(460px,min(78vh,640px))]">
      <Backdrop path={null} fade="hero" className="animate-pulse" />
    </div>
  );
}
