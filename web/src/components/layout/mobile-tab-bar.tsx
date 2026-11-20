import { NavLink } from 'react-router';
import { useIsAdmin } from '@/features/auth/use-current-user';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

export function MobileTabBar() {
  const isAdmin = useIsAdmin();
  const tabs = [
    { to: paths.library, label: 'Library', end: true },
    ...(isAdmin ? [{ to: paths.admin.dashboard, label: 'Admin', end: false }] : []),
    { to: paths.account, label: 'Account', end: false },
  ];

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#1c1c1f] bg-background/95 px-3 pt-3.5 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-2 font-mono text-[11px] font-medium tracking-[0.1em] uppercase outline-none',
              isActive ? 'text-foreground' : 'text-subtle',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span aria-hidden className={cn('h-0.5 w-[18px]', isActive && 'bg-amber')} />
              {tab.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
