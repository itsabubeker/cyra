import { useEffect, useState } from 'react';
import type { PlaybackSupport } from '@/lib/media-file';
import type { PlaybackProgress } from '../components/cyra-player';

const METADATA_TIMEOUT_MS = 15_000;
const NEAR_END_RATIO = 0.95;

interface PlaybackStateOptions {
  support: PlaybackSupport;
  watched: boolean;
}

/** Tracks whether the browser can play the file and whether the viewer reached the last 5%. */
export function usePlaybackState({ support, watched }: PlaybackStateOptions) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  useEffect(() => {
    if (support !== 'maybe' || loaded || failed) return;
    const timeout = setTimeout(() => setFailed(true), METADATA_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [support, loaded, failed]);

  const onProgress = ({ currentTime, duration }: PlaybackProgress) => {
    if (duration <= 0) return;
    if (!loaded) setLoaded(true);
    const reached = currentTime / duration >= NEAR_END_RATIO;
    if (reached !== nearEnd) setNearEnd(reached);
  };

  return {
    showFallback: support === 'external' || failed,
    fallbackReason: support === 'external' ? ('unsupported' as const) : ('failed' as const),
    showWatchedPrompt: nearEnd && !watched && !promptDismissed,
    onProgress,
    onPlaybackError: () => setFailed(true),
    dismissPrompt: () => setPromptDismissed(true),
  };
}
