import { useState } from 'react';
import { backdropSrcSet, tmdbImage } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

const FADES = {
  hero: 'bg-[radial-gradient(ellipse_75%_85%_at_68%_38%,transparent_25%,rgba(10,10,11,.88)_78%),linear-gradient(0deg,#0a0a0b_2%,transparent_45%),linear-gradient(180deg,rgba(10,10,11,.7),transparent_22%)]',
  page: 'bg-[linear-gradient(0deg,#0a0a0b_4%,transparent_60%),linear-gradient(180deg,rgba(10,10,11,.7),transparent_30%)]',
  side: 'bg-[linear-gradient(90deg,#0a0a0b_40%,rgba(10,10,11,.6)_70%,transparent)]',
} as const;

interface BackdropProps {
  path: string | null;
  fade?: keyof typeof FADES;
  className?: string;
  imageClassName?: string;
}

export function Backdrop({ path, fade = 'page', className, imageClassName }: BackdropProps) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : tmdbImage(path, 'w1280');

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_60%_40%,#3a3328,#0a0a0b_70%)]',
        className,
      )}
    >
      {src && path && (
        <img
          src={src}
          srcSet={backdropSrcSet(path)}
          sizes="100vw"
          alt=""
          decoding="async"
          onError={() => setFailed(true)}
          className={cn('absolute inset-0 size-full object-cover animate-in fade-in duration-700', imageClassName)}
        />
      )}
      <div className={cn('absolute inset-0', FADES[fade])} />
    </div>
  );
}
