import { useState, type FormEvent } from 'react';
import { FilterChip } from '@/components/shared/filter-chip';

const MIN_YEAR = 1888;
const MAX_YEAR = new Date().getFullYear() + 1;

interface YearFilterProps {
  year: number | undefined;
  onChange: (year: number | undefined) => void;
}

export function YearFilter({ year, onChange }: YearFilterProps) {
  const [draft, setDraft] = useState('');

  if (year) return <FilterChip label={`Year ${year}`} onRemove={() => onChange(undefined)} />;

  const apply = (event?: FormEvent) => {
    event?.preventDefault();
    const value = Number(draft);
    if (Number.isInteger(value) && value >= MIN_YEAR && value <= MAX_YEAR) {
      onChange(value);
      setDraft('');
    }
  };

  return (
    <form onSubmit={apply} className="flex">
      <input
        type="number"
        inputMode="numeric"
        min={MIN_YEAR}
        max={MAX_YEAR}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => apply()}
        placeholder="Year"
        aria-label="Filter by release year"
        className="h-8 w-24 rounded-full border border-input bg-transparent px-3.5 text-[13px] outline-none [appearance:textfield] placeholder:text-soft focus-visible:border-amber [&::-webkit-inner-spin-button]:appearance-none"
      />
    </form>
  );
}
