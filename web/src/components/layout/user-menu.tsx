import { Link } from 'react-router';
import { LogOut, Shield, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/features/auth/api';
import { useCurrentUser } from '@/features/auth/use-current-user';
import { paths } from '@/lib/paths';

export function UserMenu() {
  const user = useCurrentUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${user.username}`}
        className="grid size-9 cursor-pointer place-items-center rounded-full border border-foreground/45 text-sm font-medium uppercase outline-none hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {user.username.charAt(0)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="display truncate text-xl">{user.username}</span>
          <span className="eyebrow text-[10px] text-amber">{user.role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={paths.account}>
            <User /> Account
          </Link>
        </DropdownMenuItem>
        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link to={paths.admin.dashboard}>
              <Shield /> Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
