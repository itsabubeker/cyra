import type { ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';
import type { Job } from '@/api/types';
import { cn } from '@/lib/utils';
import { progressPercent } from '../jobs/job-format';

interface PipelineStepProps {
  step: string;
  title: string;
  status: ReactNode;
  description: ReactNode;
  active?: boolean;
  children?: ReactNode;
}

export function PipelineStep({ step, title, status, description, active = false, children }: PipelineStepProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-3.5 p-6 first:rounded-t-lg last:rounded-b-lg lg:first:rounded-l-lg lg:first:rounded-tr-none lg:last:rounded-r-lg lg:last:rounded-bl-none',
        active ? 'border border-amber-border bg-[#1a1812]' : 'bg-card',
      )}
    >
      <header className={cn('eyebrow flex justify-between gap-3', active && 'text-amber')}>
        <span>{step}</span>
        <span className="text-right">{status}</span>
      </header>
      <h2 className="display text-[34px] leading-none">{title}</h2>
      <p className="text-sm leading-relaxed text-pretty text-body">{description}</p>
      {children}
    </article>
  );
}

export function JobProgress({ job }: { job: Job }) {
  const percent = progressPercent(job);

  return (
    <div className="flex flex-col gap-2">
      {percent === null ? (
        <div className="h-1 overflow-hidden rounded-full bg-input" role="progressbar" aria-label="Working">
          <div className="h-full w-1/3 animate-[indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-amber" />
        </div>
      ) : (
        <Progress value={percent} aria-label="Progress" className="h-1 bg-input [&>*]:bg-amber" />
      )}
      {job.progress && (
        <p className="font-mono text-xs text-amber">
          {String(job.progress.done).padStart(3, '0')} / {job.progress.total} FILES
        </p>
      )}
    </div>
  );
}
