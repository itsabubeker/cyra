import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

const TABS = [
  { to: paths.admin.dashboard, label: 'Dashboard', end: true },
  { to: paths.admin.files, label: 'Files', end: false },
  { to: paths.admin.users, label: 'Users', end: false },
];

export function AdminLayout() {
  return (
    <main className="pt-(--nav-height) pb-28 md:pb-16">
      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-4 pt-6 md:px-11">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'rounded-full px-3.5 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </main>
  );
}

interface AdminPageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function AdminPageHeader({ title, children }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6 md:flex-row md:items-end md:gap-7 md:px-11 md:pt-8">
      <h1 className="display text-5xl md:text-[72px]">{title}</h1>
      {children && <div className="md:mb-2">{children}</div>}
    </div>
  );
}
