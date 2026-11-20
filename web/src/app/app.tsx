import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { bootKeys } from '@/features/auth/api';
import { session } from '@/lib/session';
import { queryClient } from './query-client';
import { router } from './router';

/** Drops every cached response except the boot checks when the session ends, so no data leaks between accounts. */
function useClearCacheOnSignOut() {
  useEffect(
    () =>
      session.subscribe(() => {
        if (session.getToken()) return;
        queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== bootKeys.all[0] });
      }),
    [],
  );
}

export function App() {
  useClearCacheOnSignOut();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" mobileOffset={{ bottom: 96 }} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
