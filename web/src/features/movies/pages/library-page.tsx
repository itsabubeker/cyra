import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';
import { movieListQuery } from '../api';
import { EmptyLibrary, NoResults } from '../components/library-empty-state';
import { LibraryHero, LibraryHeroPlaceholder } from '../components/library-hero';
import { MovieGrid, MovieGridSkeleton } from '../components/movie-grid';
import { MovieSearch } from '../components/movie-search';
import { YearFilter } from '../components/year-filter';
import { useHeroMovie } from '../hooks/use-hero-movie';
import { useLibraryFilters } from '../hooks/use-library-filters';

export function LibraryPage() {
  useDocumentTitle('Library');
  const filters = useLibraryFilters();
  const { search, year, hideWatched, hasServerFilters } = filters;
  const query = useInfiniteQuery(movieListQuery({ search: search || undefined, year }));

  const movies = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const total = query.data?.pages[0]?.total ?? 0;
  const visibleMovies = hideWatched ? movies.filter((movie) => !movie.watched) : movies;

  const hero = useHeroMovie(query.data?.pages[0]?.items, !hasServerFilters);
  const showHero = !hasServerFilters && (query.isPending || hero.isLoading || hero.movie !== undefined);

  const renderContent = () => {
    if (query.isPending) return <MovieGridSkeleton />;
    if (query.isError)
      return <ErrorState error={query.error} title="Couldn't load the library" onRetry={() => query.refetch()} />;
    if (total === 0 && !hasServerFilters) return <EmptyLibrary />;
    if (total === 0) {
      return (
        <NoResults
          search={search}
          year={year}
          onClearSearch={filters.clearSearch}
          onClearYear={() => filters.setYear(undefined)}
          onClearAll={filters.clearAll}
        />
      );
    }
    if (visibleMovies.length === 0) {
      return (
        <EmptyState title="All caught up" description="You've watched every movie loaded so far.">
          <Button variant="outline" onClick={() => filters.setHideWatched(false)}>
            Show watched
          </Button>
        </EmptyState>
      );
    }
    return (
      <MovieGrid
        movies={visibleMovies}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        onLoadMore={query.fetchNextPage}
      />
    );
  };

  return (
    <div className={cn('pb-28 md:pb-16', !showHero && 'pt-(--nav-height)')}>
      {showHero && (hero.movie ? <LibraryHero movie={hero.movie} /> : <LibraryHeroPlaceholder />)}
      {showHero && <div aria-hidden className="film-strip h-[22px]" />}

      <section aria-labelledby="reel-title">
        <div className="flex flex-col gap-4 px-4 pt-6 pb-5 md:flex-row md:items-center md:px-11">
          <div className="flex items-baseline gap-3.5">
            <h2 id="reel-title" className="display text-4xl md:text-[44px]">
              {hasServerFilters ? 'Results' : 'The reel'}
            </h2>
            {query.isSuccess && (
              <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground">
                {total} {hasServerFilters ? (total === 1 ? 'MATCH' : 'MATCHES') : 'FRAMES'} · A→Z
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            <MovieSearch className="w-full md:hidden" />
            <YearFilter year={year} onChange={filters.setYear} />
            <Button
              variant="outline"
              size="sm"
              aria-pressed={hideWatched}
              title="Hides watched movies among the ones loaded so far"
              onClick={() => filters.setHideWatched(!hideWatched)}
              className={cn('border-input font-medium text-soft', hideWatched && 'border-amber text-amber')}
            >
              Hide watched
            </Button>
          </div>
        </div>
        {renderContent()}
      </section>
    </div>
  );
}
