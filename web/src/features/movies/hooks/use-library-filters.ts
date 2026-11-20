import { useSearchParams } from 'react-router';

function parseYear(value: string | null): number | undefined {
  const year = Number(value);
  return Number.isInteger(year) && year > 0 ? year : undefined;
}

/** Library filters live in the URL (`?q=&year=&unwatched=1`) so they survive refresh and back navigation. */
export function useLibraryFilters() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const year = parseYear(params.get('year'));
  const hideWatched = params.get('unwatched') === '1';

  const update = (changes: Record<string, string | undefined>) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace: true },
    );

  return {
    search,
    year,
    hideWatched,
    hasServerFilters: Boolean(search || year),
    setYear: (value: number | undefined) => update({ year: value?.toString() }),
    setHideWatched: (value: boolean) => update({ unwatched: value ? '1' : undefined }),
    clearSearch: () => update({ q: undefined }),
    clearAll: () => update({ q: undefined, year: undefined, unwatched: undefined }),
  };
}
