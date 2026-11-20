import { PLAYBACK_LABELS, playbackSupport } from '@/lib/media-file';
import { cn } from '@/lib/utils';

const SUPPORT_COLORS = {
  browser: 'text-success',
  maybe: 'text-amber',
  external: 'text-danger',
} as const;

export function PlaybackBadge({ relativePath, className }: { relativePath: string; className?: string }) {
  const support = playbackSupport(relativePath);
  return <span className={cn(SUPPORT_COLORS[support], className)}>{PLAYBACK_LABELS[support]}</span>;
}

export function ExtensionBadge({ extension }: { extension: string }) {
  return (
    <span className="rounded-[3px] border border-[#3a3a3e] px-1.5 py-px font-mono text-[11px] uppercase">
      {extension || '?'}
    </span>
  );
}
