import { Button } from '@/components/ui/button';
import type { User } from '@/api/types';
import { cn } from '@/lib/utils';

interface UserRowProps {
  user: User;
  isCurrentUser: boolean;
  onDelete: (user: User) => void;
}

export function UserRow({ user, isCurrentUser, onDelete }: UserRowProps) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#1c1c1f] py-3.5 sm:grid-cols-[44px_minmax(0,1fr)_90px_50px_auto]">
      <span
        aria-hidden
        className="display grid size-10 place-items-center rounded-full border border-foreground/35 text-xl uppercase"
      >
        {user.username.charAt(0)}
      </span>
      <div className="flex min-w-0 flex-col gap-1 sm:contents">
        <span className="display truncate text-[26px] leading-none">{user.username}</span>
        <span className="flex gap-3 sm:contents">
          <span
            className={cn(
              'font-mono text-[11px] tracking-[0.1em] uppercase',
              user.role === 'admin' ? 'text-amber' : 'text-muted-foreground',
            )}
          >
            {user.role}
          </span>
          <span className="font-mono text-[11px] text-amber">{isCurrentUser ? 'YOU' : ''}</span>
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        disabled={isCurrentUser}
        title={isCurrentUser ? "You can't delete your own account" : undefined}
        onClick={() => onDelete(user)}
        className="justify-self-end font-mono text-xs tracking-[0.06em] text-danger hover:text-danger"
      >
        DELETE
      </Button>
    </div>
  );
}
