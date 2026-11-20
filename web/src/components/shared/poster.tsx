import { useState } from 'react';
import { tmdbImage, type PosterSize } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface PosterProps {
  path: string | null;
  title: string;
  year?: number | null;
  size: PosterSize;
  dimmed?: boolean;
  showFallbackText?: boolean;
  className?: string;
  imageClassName?: string;
}

export function Poster({
  path,
  title,
  year,
  size,
  dimmed = false,
  showFallbackText = true,
  className,
  imageClassName,
}: PosterProps) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : tmdbImage(path, size);

  return (
    <div className={cn('poster-placeholder relative aspect-2/3 overflow-hidden', className)}>
      {showFallbackText && !src && (
        <div className="absolute inset-0 flex flex-col justify-end gap-1 p-3">
          <span className="display line-clamp-4 text-2xl leading-none">{title}</span>
          <span className="font-mono text-[11px] text-muted-foreground">NO POSTER{year ? ` · ${year}` : ''}</span>
        </div>
      )}
      {src && (
        <img
          src={src}
          alt={`${title} poster`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-[filter,transform] duration-300',
            dimmed && 'brightness-50 grayscale',
            imageClassName,
          )}
        />
      )}
    </div>
  );
}
