import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { Backdrop } from '@/components/shared/backdrop';
import { ErrorState } from '@/components/shared/error-state';
import { NotFound } from '@/components/shared/not-found';
import { SplashScreen } from '@/components/shared/splash-screen';
import { isApiError, streamUrl } from '@/api/http';
import type { MediaFile, Movie } from '@/api/types';
import { fileDetailQuery } from '@/features/files/api';
import { movieDetailQuery } from '@/features/movies/api';
import { useToggleWatched } from '@/features/movies/hooks/use-toggle-watched';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { fileName, playbackSupport } from '@/lib/media-file';
import { paths } from '@/lib/paths';
import { tmdbImage } from '@/lib/tmdb';
import { CyraPlayer } from '../components/cyra-player';
import { ExternalPlayerPanel } from '../components/external-player-panel';
import { MarkWatchedPrompt } from '../components/mark-watched-prompt';
import { PlayerTopBar } from '../components/player-top-bar';
import { usePlaybackState } from '../hooks/use-playback-state';

export function WatchPage() {
  const fileId = Number(useParams().fileId);
  const validId = Number.isInteger(fileId) && fileId > 0;
  const query = useQuery({ ...fileDetailQuery(fileId), enabled: validId });

  if (!validId || isApiError(query.error, 404)) {
    return (
      <NotFound
        className="min-h-dvh"
        title="File not found"
        description="This file can't be found on the server. A scan may have removed it."
      />
    );
  }
  if (query.isError) return <ErrorState className="min-h-dvh" error={query.error} onRetry={() => query.refetch()} />;
  if (query.isPending) return <SplashScreen />;

  return <Screening key={query.data.id} file={query.data} movie={query.data.movie ?? null} />;
}

function Screening({ file, movie }: { file: MediaFile; movie: Movie | null }) {
  const title = movie?.title ?? file.parsedTitle;
  useDocumentTitle(title);

  const { data: detail } = useQuery({ ...movieDetailQuery(movie?.id ?? 0), enabled: movie !== null });
  const { markWatched } = useToggleWatched();
  const playback = usePlaybackState({
    support: playbackSupport(file.relativePath),
    watched: detail?.watched ?? true,
  });

  const src = streamUrl(file.id);
  const name = fileName(file.relativePath);
  const backPath = movie ? paths.movie(movie.id) : paths.library;
  const topBar = <PlayerTopBar title={title} subtitle={name} fallbackPath={backPath} />;

  if (playback.showFallback) {
    return (
      <div className="relative grid min-h-dvh place-items-center bg-black px-4 pt-28 pb-10">
        <Backdrop path={movie?.backdropPath ?? null} className="opacity-40" />
        {topBar}
        <div className="relative w-full max-w-lg">
          <ExternalPlayerPanel streamUrl={src} fileName={name} reason={playback.fallbackReason} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-black">
      <CyraPlayer
        src={src}
        poster={tmdbImage(movie?.backdropPath ?? null, 'w1280') ?? undefined}
        onPlaybackError={playback.onPlaybackError}
        onProgress={playback.onProgress}
        className="size-full"
      >
        {topBar}
        {playback.showWatchedPrompt && movie && (
          <MarkWatchedPrompt
            title={title}
            onConfirm={() => {
              markWatched(movie.id);
              playback.dismissPrompt();
            }}
            onDismiss={playback.dismissPrompt}
          />
        )}
      </CyraPlayer>
    </div>
  );
}
