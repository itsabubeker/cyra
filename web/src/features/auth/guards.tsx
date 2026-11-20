import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router';
import { ErrorState } from '@/components/shared/error-state';
import { SplashScreen } from '@/components/shared/splash-screen';
import { paths } from '@/lib/paths';
import { useSessionToken } from '@/lib/session';
import { authStatusQuery, meQuery } from './api';
import { useCurrentUser } from './use-current-user';

export interface RedirectState {
  from?: string;
}

function useNeedsSetup() {
  return useQuery(authStatusQuery()).data?.needsSetup ?? false;
}

export function RequireAuth() {
  const token = useSessionToken();
  const needsSetup = useNeedsSetup();
  const location = useLocation();
  const me = useQuery({ ...meQuery(), enabled: Boolean(token) });

  if (needsSetup) return <Navigate to={paths.setup} replace />;
  if (!token) {
    const state: RedirectState = { from: location.pathname + location.search };
    return <Navigate to={paths.login} replace state={state} />;
  }
  if (me.isPending) return <SplashScreen />;
  if (me.isError) return <ErrorState className="min-h-dvh" error={me.error} onRetry={() => me.refetch()} />;

  return <Outlet />;
}

export function RequireAdmin() {
  const user = useCurrentUser();
  if (user.role !== 'admin') return <Navigate to={paths.library} replace />;
  return <Outlet />;
}

export function GuestOnly() {
  const token = useSessionToken();
  const needsSetup = useNeedsSetup();
  const location = useLocation();
  const from = (location.state as RedirectState | null)?.from ?? paths.library;

  if (needsSetup) return <Navigate to={paths.setup} replace />;
  if (token) return <Navigate to={from} replace />;
  return <Outlet />;
}

export function SetupOnly() {
  const token = useSessionToken();
  const needsSetup = useNeedsSetup();

  if (needsSetup) return <Outlet />;
  return <Navigate to={token ? paths.library : paths.login} replace />;
}
