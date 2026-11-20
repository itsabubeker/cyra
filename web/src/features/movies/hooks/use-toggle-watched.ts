import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { movieKeys, setWatched, updateCachedWatched } from '../api';

interface WatchedChange {
  movieId: number;
  watched: boolean;
}

interface WatchedTarget {
  id: number;
  title: string;
  watched: boolean;
}

function useSetWatched() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieId, watched }: WatchedChange) => setWatched(movieId, watched),
    onMutate: async ({ movieId, watched }) => {
      await queryClient.cancelQueries({ queryKey: movieKeys.all });
      const previous = !watched;
      updateCachedWatched(queryClient, movieId, watched);
      return { previous };
    },
    onError: (_error, { movieId }, context) => {
      if (context) updateCachedWatched(queryClient, movieId, context.previous);
      toast.error("Couldn't update watched state. Try again.");
    },
  });
}

/** Optimistically flips a movie's watched state and offers an undo toast. */
export function useToggleWatched() {
  const { mutate, isPending } = useSetWatched();

  const toggle = ({ id, title, watched }: WatchedTarget) => {
    const next = !watched;
    mutate(
      { movieId: id, watched: next },
      {
        onSuccess: () =>
          toast(next ? `${title} marked as watched` : `${title} marked as not watched`, {
            action: { label: 'Undo', onClick: () => mutate({ movieId: id, watched }) },
          }),
      },
    );
  };

  const markWatched = (movieId: number) => mutate({ movieId, watched: true });

  return { toggle, markWatched, isPending };
}
