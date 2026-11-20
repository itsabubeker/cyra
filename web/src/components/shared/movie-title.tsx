import { cn } from '@/lib/utils';

const SIZES = {
  hero: [
    'text-6xl sm:text-8xl lg:text-[140px] lg:leading-[0.82]',
    'text-5xl sm:text-7xl lg:text-[104px] lg:leading-[0.86]',
    'text-4xl sm:text-6xl lg:text-[76px] lg:leading-[0.9]',
  ],
  page: [
    'text-6xl md:text-8xl lg:text-[112px] lg:leading-[0.85]',
    'text-5xl md:text-7xl lg:text-[84px] lg:leading-[0.88]',
    'text-4xl md:text-5xl lg:text-[64px] lg:leading-[0.92]',
  ],
} as const;

function lengthTier(title: string): 0 | 1 | 2 {
  if (title.length <= 16) return 0;
  if (title.length <= 32) return 1;
  return 2;
}

interface MovieTitleProps {
  title: string;
  variant: keyof typeof SIZES;
  id?: string;
  className?: string;
}

/** Large serif movie title that shrinks as the title gets longer and never overflows its column. */
export function MovieTitle({ title, variant, id, className }: MovieTitleProps) {
  return (
    <h1
      id={id}
      title={title}
      className={cn(
        'display max-w-full text-balance break-words hyphens-auto',
        SIZES[variant][lengthTier(title)],
        className,
      )}
    >
      {title}
    </h1>
  );
}
