import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Backdrop } from '@/components/shared/backdrop';
import { FormAlert } from '@/components/shared/form-alert';
import { MovieTitle } from '@/components/shared/movie-title';
import { Poster } from '@/components/shared/poster';
import type { MovieDetail } from '@/api/types';
import { AdminMatchPanel } from '@/features/admin/matching/admin-match-panel';
import { useIsAdmin } from '@/features/auth/use-current-user';
import { preferredFile } from '@/lib/media-file';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { useToggleWatched } from '../hooks/use-toggle-watched';
import { MovieMeta } from './movie-meta';
import { FileInfo, VersionPicker } from './version-picker';

export function MovieDetails({ movie }: { movie: MovieDetail }) {
  const isAdmin = useIsAdmin();
  const { toggle } = useToggleWatched();
  const [selectedId, setSelectedId] = useState(() => preferredFile(movie.files)?.id);
  const selectedFile = movie.files.find((file) => file.id === selectedId) ?? preferredFile(movie.files);
  const hasFiles = movie.files.length > 0;

  return (
    <article className="pb-28 md:pb-16">
      <div className="relative h-[56vw] max-h-[420px] min-h-[260px]">
        <Backdrop path={movie.backdropPath} imageClassName="opacity-75 object-[center_30%]" />
        <Link
          to={paths.library}
          className="absolute top-[calc(var(--nav-height)+0.75rem)] left-4 flex items-center gap-2 font-mono text-xs tracking-[0.1em] text-muted-foreground hover:text-foreground md:left-11"
        >
          <ArrowLeft className="size-3.5" /> THE REEL
        </Link>
      </div>

      <div className="relative -mt-24 grid gap-8 px-5 md:px-11 lg:-mt-56 lg:grid-cols-[300px_minmax(0,1fr)_340px] lg:gap-12">
        <Poster
          path={movie.posterPath}
          title={movie.title}
          year={movie.year}
          size="w780"
          className="hidden shadow-[0_30px_60px_rgba(0,0,0,.6)] lg:block"
        />

        <div className="flex min-w-0 flex-col gap-4 lg:pt-32">
          <MovieTitle title={movie.title} variant="page" />
          <MovieMeta movie={movie} showVotes showImdb />
          {movie.tagline && (
            <p className="max-w-2xl font-serif text-2xl leading-snug md:text-[26px]">{movie.tagline}</p>
          )}
          {movie.overview && (
            <p className="max-w-2xl text-base leading-relaxed text-pretty text-body">{movie.overview}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-3">
            {selectedFile ? (
              <Button size="lg" asChild>
                <Link to={paths.watch(selectedFile.id)}>
                  <Play className="fill-current" /> Play
                </Link>
              </Button>
            ) : (
              <Button size="lg" disabled>
                <Play className="fill-current" /> Play
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              aria-pressed={movie.watched}
              onClick={() => toggle(movie)}
              className={cn('text-sm font-medium', movie.watched && 'border-amber text-amber')}
            >
              {movie.watched ? <Check /> : <span className="size-4 rounded-full border-[1.5px] border-current" />}
              {movie.watched ? 'Watched' : 'Mark watched'}
            </Button>
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-6 lg:pt-32">
          {!hasFiles && <FormAlert tone="warning">This movie's file is no longer in your library.</FormAlert>}
          {movie.files.length > 1 && (
            <VersionPicker files={movie.files} selectedId={selectedFile?.id} onSelect={setSelectedId} />
          )}
          {movie.files.length === 1 && <FileInfo file={movie.files[0]} />}
          {isAdmin && hasFiles && <AdminMatchPanel movieId={movie.id} files={movie.files} />}
        </aside>
      </div>
    </article>
  );
}
