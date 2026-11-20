import { NavLink } from 'react-router';
import { Logo } from '@/components/shared/logo';
import { JobIndicator } from '@/features/admin/jobs/job-indicator';
import { useIsAdmin } from '@/features/auth/use-current-user';
import { MovieSearch } from '@/features/movies/components/movie-search';
import { useScrolled } from '@/hooks/use-scrolled';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';

interface TopNavProps {
  transparentAtTop: boolean;
}

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'border-b pb-1 font-mono text-xs font-medium tracking-[0.1em] outline-none transition-colors focus-visible:text-foreground',
    isActive ? 'border-amber text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
  );

export function TopNav({ transparentAtTop }: TopNavProps) {
  const isAdmin = useIsAdmin();
  const scrolled = useScrolled();
  const solid = scrolled || !transparentAtTop;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 h-(--nav-height) transition-[background-color,border-color] duration-300',
        solid ? 'border-b border-[#1c1c1f] bg-background/85 backdrop-blur-md' : 'border-b border-transparent',
      )}
    >
      <nav
        aria-label="Main"
        className="grid h-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 md:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] md:gap-7 md:px-11"
      >
        <Logo asLink className="text-[28px] md:text-[34px]" />
        <div className="hidden gap-5 md:flex">
          <NavLink to={paths.library} end className={navLinkClasses}>
            LIBRARY
          </NavLink>
          {isAdmin && (
            <NavLink to={paths.admin.dashboard} className={navLinkClasses}>
              ADMIN
            </NavLink>
          )}
        </div>
        <MovieSearch enableShortcut className="hidden w-full max-w-[400px] justify-self-center md:flex" />
        {isAdmin ? <JobIndicator className="justify-self-end" /> : <span className="md:hidden" />}
        <div className="hidden md:block">
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
