import type { MediaFile } from '@/api/types';

export type PlaybackSupport = 'browser' | 'maybe' | 'external';

const BROWSER_EXTENSIONS = new Set(['mp4', 'm4v', 'webm']);
const MAYBE_EXTENSIONS = new Set(['mkv', 'mov']);

export const PLAYBACK_LABELS: Record<PlaybackSupport, string> = {
  browser: 'Plays in browser',
  maybe: 'May not play in browser',
  external: 'External player',
};

export const LOW_CONFIDENCE_SCORE = 0.9;

export function fileName(relativePath: string): string {
  return relativePath.split(/[\\/]/).pop() ?? relativePath;
}

export function fileExtension(relativePath: string): string {
  const name = fileName(relativePath);
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

export function playbackSupport(relativePath: string): PlaybackSupport {
  const extension = fileExtension(relativePath);
  if (BROWSER_EXTENSIONS.has(extension)) return 'browser';
  if (MAYBE_EXTENSIONS.has(extension)) return 'maybe';
  return 'external';
}

const SUPPORT_RANK: Record<PlaybackSupport, number> = { browser: 0, maybe: 1, external: 2 };

/** The version to preselect: the one most likely to play in the browser, then the largest. */
export function preferredFile<T extends Pick<MediaFile, 'relativePath' | 'sizeBytes'>>(files: T[]): T | undefined {
  return [...files].sort(
    (a, b) =>
      SUPPORT_RANK[playbackSupport(a.relativePath)] - SUPPORT_RANK[playbackSupport(b.relativePath)] ||
      b.sizeBytes - a.sizeBytes,
  )[0];
}

export function isLowConfidence(file: Pick<MediaFile, 'matchStatus' | 'matchScore'>): boolean {
  return file.matchStatus === 'matched' && file.matchScore !== null && file.matchScore < LOW_CONFIDENCE_SCORE;
}
