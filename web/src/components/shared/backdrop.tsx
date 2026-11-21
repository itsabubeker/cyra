import { useState } from 'react';
import { backdropSrcSet, tmdbImage } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

const FADES = {
  hero: 'bg-[radial-gradient(ellipse_75%_85%_at_68%_38%,transparent_25%,rgba(10,10,11,.88)_78%),linear-gradient(0deg,#0a0a0b_2%,transparent_45%),linear-gradient(180deg,rgba(10,10,11,.7),transparent_22%)]',
  page: 'bg-[linear-gradient(0deg,#0a0a0b_4%,transparent_60%),linear-gradient(180deg,rgba(10,10,11,.7),transparent_30%)]',
  side: 'bg-[linear-gradient(90deg,#0a0a0b_28%,rgba(10,10,11,.92)_38%,rgba(10,10,11,.7)_52%,rgba(10,10,11,.35)_72%,transparent)]',
  // Dims evenly for centred text and melts every edge into the page background.
  center: 'bg-[radial-gradient(closest-side,rgba(10,10,11,.72)_0%,rgba(10,10,11,.8)_55%,#0a0a0b_100%)]',
} as const;

interface BackdropProps {
  /** TMDB backdrop path such as `/abc.jpg`. */
  path?: string | null;
  /** A ready-made image URL, used instead of `path`. */
  src?: string;
  fade?: keyof typeof FADES;
  className?: string;
  imageClassName?: string;
}

export function Backdrop({ path = null, src: srcProp, fade = 'page', className, imageClassName }: BackdropProps) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : (srcProp ?? tmdbImage(path, 'w1280'));

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_60%_40%,#3a3328,#0a0a0b_70%)]',
        className,
      )}
    >
      {src && (
        <img
          src={src}
          srcSet={!srcProp && path ? backdropSrcSet(path) : undefined}
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
