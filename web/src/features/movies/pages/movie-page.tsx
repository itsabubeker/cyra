import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { NotFound } from '@/components/shared/not-found';
import { isApiError } from '@/api/http';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { movieDetailQuery } from '../api';
import { MovieDetails } from '../components/movie-details';

export function MoviePage() {
  const movieId = Number(useParams().movieId);
  const validId = Number.isInteger(movieId) && movieId > 0;
  const query = useQuery({ ...movieDetailQuery(movieId), enabled: validId });
  useDocumentTitle(query.data?.title);

  if (!validId || isApiError(query.error, 404)) {
    return (
      <NotFound
        className="min-h-dvh"
        title="Movie not found"
        description="This movie isn't in your library. It may have been removed by a scan."
      />
    );
  }
  if (query.isError) {
    return <ErrorState className="min-h-dvh" error={query.error} onRetry={() => query.refetch()} />;
  }
  if (query.isPending) return <MovieDetailsSkeleton />;

  return <MovieDetails key={query.data.id} movie={query.data} />;
}

function MovieDetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading movie">
      <Skeleton className="h-[56vw] max-h-[420px] min-h-[260px] rounded-none" />
      <div className="flex flex-col gap-4 px-5 pt-8 md:px-11">
        <Skeleton className="h-20 w-2/3 max-w-xl" />
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-24 w-full max-w-2xl" />
      </div>
    </div>
  );
}
