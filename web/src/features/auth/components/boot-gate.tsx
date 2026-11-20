import { useQuery } from '@tanstack/react-query';
import { Outlet } from 'react-router';
import { SplashScreen } from '@/components/shared/splash-screen';
import { authStatusQuery, healthQuery } from '../api';
import { ServerUnreachable } from './server-unreachable';

/** Checks the server is reachable and whether first-run setup is needed before rendering any route. */
export function BootGate() {
  const health = useQuery(healthQuery());
  const status = useQuery({ ...authStatusQuery(), enabled: health.isSuccess });

  if (health.isError || status.isError) {
    const retry = () => {
      void health.refetch();
      if (health.isSuccess) void status.refetch();
    };
    return <ServerUnreachable onRetry={retry} retrying={health.isFetching || status.isFetching} />;
  }

  if (!status.isSuccess) return <SplashScreen />;

  return <Outlet />;
}
