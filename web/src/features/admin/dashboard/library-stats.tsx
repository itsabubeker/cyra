import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { fileCountQuery } from '@/features/files/api';
import { movieCountQuery } from '@/features/movies/api';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

function StatValue({ value }: { value: number | undefined }) {
  if (value === undefined) return <Skeleton className="h-14 w-20" />;
  return <span className="font-serif text-[56px] leading-none">{value}</span>;
}

export function LibraryStats() {
  const movies = useQuery(movieCountQuery()).data;
  const files = useQuery(fileCountQuery()).data;
  const matched = useQuery(fileCountQuery('matched')).data;
  const manual = useQuery(fileCountQuery('manual')).data;
  const unmatched = useQuery(fileCountQuery('unmatched')).data;

  const stats = [
    { label: 'Movies', value: movies },
    { label: 'Files', value: files },
    { label: 'Matched', value: matched },
    { label: 'Manual', value: manual },
  ];

  return (
    <section
      aria-label="Library stats"
      className="mx-4 mt-8 grid grid-cols-2 border-y border-border sm:grid-cols-3 md:mx-11 lg:grid-cols-5"
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={i === 0 ? 'flex flex-col gap-1.5 py-5' : 'flex flex-col gap-1.5 border-l py-5 pl-6'}
        >
          <StatValue value={stat.value} />
          <span className="eyebrow">{stat.label}</span>
        </div>
      ))}
      <Link
        to={`${paths.admin.files}?status=unmatched`}
        className={cn(
          'col-span-2 flex flex-col gap-1.5 px-6 py-5 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-foreground sm:col-span-1',
          unmatched ? 'bg-amber text-background' : 'border-l',
        )}
      >
        {unmatched === undefined ? (
          <Skeleton className="h-14 w-20" />
        ) : (
          <span className="font-serif text-[56px] leading-none">{unmatched}</span>
        )}
        <span className="flex justify-between font-mono text-[11px] font-semibold tracking-[0.12em]">
          <span>UNMATCHED</span>
          {unmatched ? <span>REVIEW →</span> : null}
        </span>
      </Link>
    </section>
  );
}
