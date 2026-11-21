import type { ReactNode } from 'react';
import { sceneBackground } from '@/lib/backgrounds';
import { cn } from '@/lib/utils';
import { Backdrop } from './backdrop';

interface EmptyStateProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  indicator?: ReactNode;
  fullScreen?: boolean;
  /** Shows a film still behind the text, for screens that are otherwise bare. */
  backdrop?: boolean;
  className?: string;
}

export function EmptyState({
  eyebrow,
  title,
  description,
  children,
  indicator,
  fullScreen = false,
  backdrop = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-16 text-center',
        fullScreen && 'min-h-dvh',
        // isolate + -z-10 keeps the backdrop behind the content without lifting every child.
        backdrop && 'relative isolate overflow-hidden',
        className,
      )}
    >
      {backdrop && <Backdrop src={sceneBackground} fade="center" className="-z-10" />}
      {indicator}
      {eyebrow && <p className="eyebrow text-amber">{eyebrow}</p>}
      <h2 className="display text-4xl leading-none text-balance sm:text-5xl">{title}</h2>
      {description && <div className="max-w-md text-[15px] leading-relaxed text-muted-foreground">{description}</div>}
      {children && <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
