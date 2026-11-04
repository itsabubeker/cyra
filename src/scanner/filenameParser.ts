import { VIDEO_EXTS } from './video-extensions.js';

export interface ParsedFilename {
  title: string;
  year: number | null;
}

const VIDEO_EXTENSION = new RegExp(`\\.(${VIDEO_EXTS.join('|')})$`, 'i');

const EDITION_SUFFIX =
  /(\s+(extended|unrated|director'?s? cut|remastered|theatrical|special edition))+$/i;

// Quality / source / codec tags. Used to cut the title when there's no year.
const JUNK =
  /\b(2160p|1080p|720p|480p|4k|uhd|bluray|blu-ray|bdrip|brrip|webrip|web-dl|webdl|hdtv|dvdrip|hdrip|remux|x264|x265|h264|h265|hevc|aac|ac3|dts|extended|unrated|remastered|proper|repack)\b/i;

const FIRST_FILM_YEAR = 1888;
// Rejects "Blade Runner 2049" style titles: 2049 is not a plausible release year.
const MAX_YEAR = new Date().getFullYear() + 1;

function findYear(name: string): { year: number; index: number } | null {
  let found: { year: number; index: number } | null = null;

  for (const match of name.matchAll(/(?<!\d)(?:19|20)\d{2}(?!\d)/g)) {
    const year = Number(match[0]);
    const index = match.index ?? 0;

    if (year < FIRST_FILM_YEAR || year > MAX_YEAR) continue;
    // A number at the very start is part of the title ("1917", "2001 A Space Odyssey").
    if (index === 0) continue;

    // Keep the LAST valid year: "Wonder Woman 1984 2020" -> 2020.
    found = { year, index };
  }

  return found;
}

export function parseFilename(filename: string): ParsedFilename {
  let name = filename
    .replace(VIDEO_EXTENSION, '')
    .replace(/^\[[^\]]*\]\s*/, '') // leading release group: "[YTS] Movie..."
    .replace(/[._]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const found = findYear(name);

  let titlePart: string;
  if (found) {
    titlePart = name.slice(0, found.index);
  } else {
    const junkIndex = name.search(JUNK);
    titlePart = junkIndex > 0 ? name.slice(0, junkIndex) : name;
  }

  const title = titlePart
    .replace(/[[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(EDITION_SUFFIX, '')
    .replace(/[\s\-–]+$/, '')
    .trim();

  return { title, year: found?.year ?? null };
}
