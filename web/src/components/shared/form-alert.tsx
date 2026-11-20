import type { ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormAlertProps {
  children: ReactNode;
  tone?: 'error' | 'warning' | 'info';
  className?: string;
}

const TONES = {
  error: 'text-danger',
  warning: 'rounded-lg border border-amber-border bg-amber-surface p-3.5 text-soft [&_svg]:text-amber',
  info: 'rounded-lg border border-input bg-card p-3.5 text-soft',
} as const;

export function FormAlert({ children, tone = 'error', className }: FormAlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className={cn('flex items-start gap-2.5 text-[13px] leading-normal', TONES[tone], className)}
    >
      {tone === 'warning' && <TriangleAlert className="mt-0.5 size-4 shrink-0" />}
      <div>{children}</div>
    </div>
  );
}
