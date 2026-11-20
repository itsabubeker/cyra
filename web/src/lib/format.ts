const numberFormat = new Intl.NumberFormat('en-US');
const relativeTimeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unit]}`;
}

export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function formatRating(voteAverage: number): string {
  return voteAverage.toFixed(1);
}

export function formatCount(value: number): string {
  return numberFormat.format(value);
}

export function formatPercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function formatFrameNumber(index: number): string {
  return String(index + 1).padStart(3, '0');
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return relativeTimeFormat.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}
