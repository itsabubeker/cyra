import '@videojs/react/video/skin.css';
import { useEffect } from 'react';
import { selectError, usePlayer } from '@videojs/react';
import { Video, VideoPlayer, VideoSkin } from '@videojs/react/video';

export interface PlaybackError {
  code: number;
  message: string;
}

export interface CyraPlayerProps {
  /** Absolute or same-origin stream URL, e.g. from `streamUrl(fileId, token)`. */
  src: string;
  /** Full image URL (TMDB backdrop), shown until playback starts. */
  poster?: string;
  /**
   * Fires when the browser can't play the file (unsupported container/codec,
   * 404, expired token). Use it to switch to the "external player" fallback.
   */
  onPlaybackError?: (error: PlaybackError) => void;
  className?: string;
}

/**
 * Cyra's video player: Video.js v10, default skin, plain HTML5 `<video>`.
 * Cyra streams files directly with HTTP Range support, so no HLS/DASH engine is needed.
 */
export function CyraPlayer({ src, poster, onPlaybackError, className }: CyraPlayerProps) {
  return (
    <VideoPlayer poster={poster}>
      <VideoSkin className={className} style={{ width: '100%', aspectRatio: '16 / 9' }}>
        <Video src={src} playsInline preload="metadata" />
      </VideoSkin>
      {onPlaybackError && <PlaybackErrorReporter onError={onPlaybackError} />}
    </VideoPlayer>
  );
}

// Must render inside <VideoPlayer> to read its store. Pass a stable onError.
function PlaybackErrorReporter({ onError }: { onError: (error: PlaybackError) => void }) {
  const error = usePlayer(selectError)?.error;

  useEffect(() => {
    if (error) onError(error);
  }, [error, onError]);

  return null;
}
