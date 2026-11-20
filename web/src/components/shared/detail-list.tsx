import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DetailListProps {
  items: { label: string; value: ReactNode }[];
  className?: string;
}

export function DetailList({ items, className }: DetailListProps) {
  return (
    <dl className={cn('grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-mono text-xs', className)}>
      {items.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt className="tracking-[0.08em] text-subtle uppercase">{label}</dt>
          <dd className="min-w-0 break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
