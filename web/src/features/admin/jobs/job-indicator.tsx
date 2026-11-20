import { Link } from 'react-router';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { useCurrentJob } from './api';
import { progressLabel } from './job-format';

export function JobIndicator({ className }: { className?: string }) {
  const { data: job } = useCurrentJob();
  const running = job?.status === 'running';

  return (
    <Link
      to={paths.admin.dashboard}
      aria-live="polite"
      className={cn(
        'flex items-center gap-2.5 rounded-full font-mono text-xs tracking-[0.06em] whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring',
        running ? 'text-amber' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {running && <span className="size-[7px] animate-pulse rounded-full bg-amber shadow-[0_0_10px_var(--amber)]" />}
      {running ? progressLabel(job) : 'IDLE'}
    </Link>
  );
}
