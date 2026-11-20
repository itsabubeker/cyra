import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Pagination } from '@/components/shared/pagination';
import type { User } from '@/api/types';
import { useCurrentUser } from '@/features/auth/use-current-user';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { AddUserForm } from './add-user-form';
import { USERS_PAGE_SIZE, userListQuery } from './api';
import { DeleteUserDialog } from './delete-user-dialog';
import { UserRow } from './user-row';

export function UsersPage() {
  useDocumentTitle('Users');
  const currentUser = useCurrentUser();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<User | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());
  const query = useQuery(userListQuery(debouncedSearch, page));
  const pageCount = query.data ? Math.ceil(query.data.total / USERS_PAGE_SIZE) : 0;

  return (
    <div className="mt-6 grid border-t border-[#1c1c1f] lg:grid-cols-[minmax(0,1fr)_400px]">
      <section className="flex flex-col px-4 py-8 md:px-11">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="display text-5xl md:text-[56px]">Who's watching</h1>
          <label className="flex h-10 items-center gap-2.5 rounded-full border border-input bg-card px-4 focus-within:border-amber sm:w-64">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search usernames"
              aria-label="Search usernames"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col border-t">
          {query.isError && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
          {query.isPending && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="my-3 h-11" />)}
          {query.data?.items.length === 0 && <EmptyState title={`No one matches ‘${debouncedSearch}’`} />}
          {query.data?.items.map((user) => (
            <UserRow key={user.id} user={user} isCurrentUser={user.id === currentUser.id} onDelete={setDeleting} />
          ))}
        </div>
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} className="mt-5" />

        <p className="mt-6 max-w-xl text-[13px] leading-relaxed text-subtle">
          Forgot a password? Delete the account and create it again. Roles and other people's passwords can't be edited.
        </p>
      </section>

      <aside className="border-t bg-sunken px-4 py-8 md:px-8 lg:border-t-0 lg:border-l">
        <AddUserForm />
      </aside>

      <DeleteUserDialog user={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </div>
  );
}
