import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  indicator?: ReactNode;
  fullScreen?: boolean;
  className?: string;
}

export function EmptyState({
  eyebrow,
  title,
  description,
  children,
  indicator,
  fullScreen = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-16 text-center',
        fullScreen && 'min-h-dvh',
        className,
      )}
    >
      {indicator}
      {eyebrow && <p className="eyebrow text-amber">{eyebrow}</p>}
      <h2 className="display text-4xl leading-none text-balance sm:text-5xl">{title}</h2>
      {description && <div className="max-w-md text-[15px] leading-relaxed text-muted-foreground">{description}</div>}
      {children && <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
