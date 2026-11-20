import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/shared/form-alert';
import { TextField } from '@/components/shared/text-field';
import { isApiError } from '@/api/http';
import { applyServerErrors } from '@/lib/errors';
import { authStatusQuery, useSetupAdmin } from '../api';
import { AuthLayout } from '../components/auth-layout';
import { setupSchema, type SetupValues } from '../schemas';

export function SetupPage() {
  const queryClient = useQueryClient();
  const setup = useSetupAdmin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SetupValues>({ resolver: zodResolver(setupSchema) });

  const onSubmit = handleSubmit(({ username, password }) =>
    setup.mutateAsync({ username, password }).catch((error: unknown) => {
      if (isApiError(error, 409)) {
        queryClient.setQueryData(authStatusQuery().queryKey, { needsSetup: false });
        return;
      }
      applyServerErrors(setError, error, ['username', 'password']);
    }),
  );

  return (
    <AuthLayout eyebrow="First run" description="Create the admin account for your Cyra server.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label="Username"
          hint="3–32"
          autoComplete="username"
          autoCapitalize="none"
          autoFocus
          error={errors.username?.message}
          {...register('username')}
        />
        <TextField
          label="Password"
          hint="8–128"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        {errors.root?.server && <FormAlert>{errors.root.server.message}</FormAlert>}
        <Button type="submit" size="lg" disabled={setup.isPending} className="mt-2">
          {setup.isPending ? 'Creating account…' : 'Create admin account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
