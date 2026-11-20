import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '@/api/http';
import type { ChangePasswordInput, Credentials, HealthResponse, User } from '@/api/types';
import { session } from '@/lib/session';

export const bootKeys = {
  all: ['boot'] as const,
  health: () => [...bootKeys.all, 'health'] as const,
  status: () => [...bootKeys.all, 'status'] as const,
};

export const healthQuery = () =>
  queryOptions({
    queryKey: bootKeys.health(),
    queryFn: () => request<HealthResponse>('/health'),
    retry: false,
    staleTime: Infinity,
  });

export const authStatusQuery = () =>
  queryOptions({
    queryKey: bootKeys.status(),
    queryFn: () => request<{ needsSetup: boolean }>('/auth/status'),
    staleTime: Infinity,
  });

export const meQuery = () =>
  queryOptions({
    queryKey: ['auth', 'me'],
    queryFn: () => request<User>('/auth/me'),
    staleTime: Infinity,
  });

async function login(credentials: Credentials) {
  const { accessToken } = await request<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: credentials,
  });
  session.start(accessToken);
}

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useSetupAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      await request<User>('/auth/setup', { method: 'POST', body: credentials });
      await login(credentials);
      queryClient.setQueryData(authStatusQuery().queryKey, { needsSetup: false });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      request<void>('/auth/change-password', { method: 'PATCH', body: input }),
    onSuccess: () => session.end('password-changed'),
  });
}

export function signOut() {
  session.end('signed-out');
}
