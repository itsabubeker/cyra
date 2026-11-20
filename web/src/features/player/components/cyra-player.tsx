import '@videojs/react/video/skin.css';
import { useEffect, useEffectEvent, type CSSProperties, type ReactNode } from 'react';
import { selectError, selectTime, usePlayer } from '@videojs/react';
import { Video, VideoPlayer, VideoSkin } from '@videojs/react/video';

export interface PlaybackError {
  code: number;
  message: string;
}

export interface PlaybackProgress {
  currentTime: number;
  duration: number;
}

interface CyraPlayerProps {
  src: string;
  poster?: string;
  onPlaybackError?: (error: PlaybackError) => void;
  onProgress?: (progress: PlaybackProgress) => void;
  children?: ReactNode;
  className?: string;
}

const SKIN_THEME = {
  '--media-accent-color': 'var(--amber)',
  '--media-font-family': 'var(--font-sans)',
  '--media-border-radius': '0',
} as CSSProperties;

/**
 * Cyra's video player: Video.js v10, default skin, plain HTML5 `<video>`.
 * Cyra streams files directly with HTTP Range support, so no HLS/DASH engine is needed.
 * The default skin provides keyboard shortcuts: Space/K, ←/→, ↑/↓, M and F.
 * `children` render inside the player so overlays stay visible in fullscreen.
 */
export function CyraPlayer({ src, poster, onPlaybackError, onProgress, children, className }: CyraPlayerProps) {
  return (
    <VideoPlayer poster={poster}>
      <VideoSkin className={className} style={SKIN_THEME}>
        <Video src={src} playsInline preload="metadata" autoPlay />
        {children}
      </VideoSkin>
      {onPlaybackError && <PlaybackErrorReporter onError={onPlaybackError} />}
      {onProgress && <ProgressReporter onProgress={onProgress} />}
    </VideoPlayer>
  );
}

function PlaybackErrorReporter({ onError }: { onError: (error: PlaybackError) => void }) {
  const error = usePlayer(selectError)?.error;
  const report = useEffectEvent(onError);

  useEffect(() => {
    if (error) report(error);
  }, [error]);

  return null;
}

function ProgressReporter({ onProgress }: { onProgress: (progress: PlaybackProgress) => void }) {
  const time = usePlayer(selectTime);
  const report = useEffectEvent(onProgress);
  const currentTime = time?.currentTime ?? 0;
  const duration = time?.duration ?? 0;

  useEffect(() => {
    report({ currentTime, duration });
  }, [currentTime, duration]);

  return null;
}
