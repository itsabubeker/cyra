import { useQuery } from '@tanstack/react-query';
import { meQuery } from './api';

/** The signed-in user. Only use below `RequireAuth`, which guarantees the data is loaded. */
export function useCurrentUser() {
  const { data } = useQuery(meQuery());
  if (!data) throw new Error('useCurrentUser must be used inside RequireAuth');
  return data;
}

export function useIsAdmin() {
  return useCurrentUser().role === 'admin';
}
