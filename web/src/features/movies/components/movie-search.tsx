import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useKeyShortcut } from '@/hooks/use-key-shortcut';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

interface MovieSearchProps {
  className?: string;
  enableShortcut?: boolean;
}

/**
 * Title search bound to the library's `?q=` param. Typing on any other page
 * takes you to the library with the query applied.
 */
export function MovieSearch({ className, enableShortcut = false }: MovieSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const onLibrary = location.pathname === paths.library;
  const urlQuery = onLibrary ? (params.get('q') ?? '') : '';

  const [value, setValue] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setValue(urlQuery);
  }

  const debouncedValue = useDebouncedValue(value.trim());

  const applyQuery = useEffectEvent((query: string) => {
    if (query === urlQuery || (!onLibrary && !query)) return;
    const next = new URLSearchParams(onLibrary ? params : undefined);
    if (query) next.set('q', query);
    else next.delete('q');
    navigate({ pathname: paths.library, search: next.toString() }, { replace: onLibrary });
  });

  useEffect(() => applyQuery(debouncedValue), [debouncedValue]);

  useKeyShortcut('/', (event) => {
    if (!enableShortcut) return;
    event.preventDefault();
    inputRef.current?.focus();
  });

  return (
    <div
      role="search"
      className={cn(
        'flex h-10 items-center gap-2.5 rounded-full border border-foreground/20 bg-card/70 px-4 backdrop-blur-md transition-colors focus-within:border-amber',
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && setValue('')}
        placeholder="Search the reel"
        aria-label="Search movies by title"
        className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setValue('')}
          className="cursor-pointer rounded-full p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : (
        enableShortcut && (
          <kbd className="rounded border border-foreground/25 px-1.5 font-mono text-[11px] text-muted-foreground">
            /
          </kbd>
        )
      )}
    </div>
  );
}
