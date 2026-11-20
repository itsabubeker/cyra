import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { errorMessage } from '@/lib/errors';
import { preferredFile } from '@/lib/media-file';
import { paths } from '@/lib/paths';
import { movieDetailQuery } from '../api';

/** Opens the player for a movie's preferred version, or its detail page when it has no files. */
export function usePlayMovie() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async (movieId: number) => {
    try {
      const movie = await queryClient.fetchQuery(movieDetailQuery(movieId));
      const file = preferredFile(movie.files);
      navigate(file ? paths.watch(file.id) : paths.movie(movieId));
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
}
