import { Outlet, useMatches } from 'react-router';
import { useJobNotifications } from '@/features/admin/jobs/use-job-notifications';
import { useIsAdmin } from '@/features/auth/use-current-user';
import { MobileTabBar } from './mobile-tab-bar';
import { TopNav } from './top-nav';

export interface RouteHandle {
  /** The page starts with a full-bleed image, so the nav stays transparent until scrolled. */
  heroNav?: boolean;
}

export function AppLayout() {
  const isAdmin = useIsAdmin();
  const matches = useMatches();
  const heroNav = matches.some((match) => (match.handle as RouteHandle | undefined)?.heroNav);

  return (
    <>
      {isAdmin && <JobNotifications />}
      <TopNav transparentAtTop={heroNav} />
      <Outlet />
      <MobileTabBar />
    </>
  );
}

function JobNotifications() {
  useJobNotifications();
  return null;
}
