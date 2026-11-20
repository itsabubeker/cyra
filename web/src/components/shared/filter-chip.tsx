import { X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="flex h-8 items-center gap-2 rounded-full bg-primary py-1 pr-1.5 pl-3.5 text-[13px] font-medium text-primary-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="grid size-5 cursor-pointer place-items-center rounded-full bg-background text-foreground outline-none hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
