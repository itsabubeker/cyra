import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { paths } from '@/lib/paths';

interface LogoProps {
  className?: string;
  asLink?: boolean;
}

export function Logo({ className, asLink = false }: LogoProps) {
  const mark = <span className={cn('display text-[34px] leading-none', className)}>Cyra</span>;
  if (!asLink) return mark;
  return (
    <Link to={paths.library} aria-label="Cyra library" className="rounded-sm hover:opacity-80">
      {mark}
    </Link>
  );
}
