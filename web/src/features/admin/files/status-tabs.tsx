import { useQuery } from '@tanstack/react-query';
import type { MatchStatus } from '@/api/types';
import { fileCountQuery } from '@/features/files/api';
import { cn } from '@/lib/utils';

const TABS: { status: MatchStatus | undefined; label: string }[] = [
  { status: undefined, label: 'All' },
  { status: 'unmatched', label: 'Unmatched' },
  { status: 'matched', label: 'Matched' },
  { status: 'manual', label: 'Manual' },
];

interface StatusTabsProps {
  value: MatchStatus | undefined;
  onChange: (status: MatchStatus | undefined) => void;
}

export function StatusTabs({ value, onChange }: StatusTabsProps) {
  return (
    <div role="tablist" aria-label="Filter by match status" className="flex flex-wrap gap-1">
      {TABS.map((tab) => (
        <StatusTab key={tab.label} {...tab} selected={tab.status === value} onSelect={() => onChange(tab.status)} />
      ))}
    </div>
  );
}

interface StatusTabProps {
  status: MatchStatus | undefined;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function StatusTab({ status, label, selected, onSelect }: StatusTabProps) {
  const { data: count } = useQuery(fileCountQuery(status));

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        'cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-foreground/40',
        !selected && status === 'unmatched' && count ? 'text-danger' : undefined,
      )}
    >
      {label} {count ?? '…'}
    </button>
  );
}
