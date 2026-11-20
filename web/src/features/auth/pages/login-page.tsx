import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/shared/form-alert';
import { TextField } from '@/components/shared/text-field';
import { isApiError } from '@/api/http';
import { applyServerErrors } from '@/lib/errors';
import { session, type SessionEndReason } from '@/lib/session';
import { useLogin } from '../api';
import { AuthLayout } from '../components/auth-layout';
import { loginSchema, type LoginValues } from '../schemas';

const END_NOTICES: Partial<Record<SessionEndReason, string>> = {
  expired: 'Your session ended. Sign in again.',
  'password-changed': 'Password changed. Sign in with your new password.',
};

export function LoginPage() {
  const notice = END_NOTICES[session.getEndReason() ?? 'signed-out'];
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) =>
    login.mutateAsync(values).catch((error: unknown) => {
      if (isApiError(error, 401)) setError('root.server', { message: 'Invalid username or password' });
      else applyServerErrors(setError, error, ['username', 'password']);
    }),
  );

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {notice && <FormAlert tone="info">{notice}</FormAlert>}
        <TextField
          label="Username"
          autoComplete="username"
          autoCapitalize="none"
          autoFocus
          error={errors.username?.message}
          {...register('username')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {errors.root?.server && <FormAlert>{errors.root.server.message}</FormAlert>}
        <Button type="submit" size="lg" disabled={login.isPending} className="mt-2">
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
