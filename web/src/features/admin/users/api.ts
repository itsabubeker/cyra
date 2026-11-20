import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isApiError, request } from '@/api/http';
import type { CreateUserInput, Paginated, User } from '@/api/types';
import { errorMessage } from '@/lib/errors';

export const USERS_PAGE_SIZE = 20;

const userKeys = {
  all: ['users'] as const,
  list: (search: string, page: number) => [...userKeys.all, 'list', { search, page }] as const,
};

export const userListQuery = (search: string, page: number) =>
  queryOptions({
    queryKey: userKeys.list(search, page),
    queryFn: () =>
      request<Paginated<User>>('/users', { query: { search: search || undefined, page, size: USERS_PAGE_SIZE } }),
    placeholderData: (previous) => previous,
  });

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => request<User>('/users', { method: 'POST', body: input }),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success(`Account created for ${user.username}`, {
        description: 'Share the password with them yourself.',
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => request<void>(`/users/${user.id}`, { method: 'DELETE' }),
    onSuccess: (_, user) => toast.success(`${user.username} was deleted`),
    onError: (error) => {
      if (!isApiError(error, 404)) toast.error(errorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
