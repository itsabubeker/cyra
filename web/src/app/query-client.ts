import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/api/http';

const NO_RETRY_STATUSES = new Set([400, 401, 403, 404, 409]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => !(isApiError(error) && NO_RETRY_STATUSES.has(error.status)) && failureCount < 2,
    },
    mutations: {
      retry: false,
    },
  },
});
