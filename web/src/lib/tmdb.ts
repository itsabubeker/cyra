export type PosterSize = 'w92' | 'w342' | 'w780';
export type BackdropSize = 'w780' | 'w1280' | 'original';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function tmdbImage(path: string | null, size: PosterSize | BackdropSize): string | null {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

export function backdropSrcSet(path: string): string {
  return [
    `${tmdbImage(path, 'w780')} 780w`,
    `${tmdbImage(path, 'w1280')} 1280w`,
    `${tmdbImage(path, 'original')} 1920w`,
  ].join(', ');
}

export function imdbUrl(imdbId: string): string {
  return `https://www.imdb.com/title/${imdbId}`;
}
