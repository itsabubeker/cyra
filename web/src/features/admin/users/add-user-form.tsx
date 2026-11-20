import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FormAlert } from '@/components/shared/form-alert';
import { TextField } from '@/components/shared/text-field';
import { isApiError } from '@/api/http';
import { passwordSchema, usernameSchema } from '@/features/auth/schemas';
import { applyServerErrors } from '@/lib/errors';
import { useCreateUser } from './api';

const addUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  role: z.enum(['user', 'admin']),
});

type AddUserValues = z.infer<typeof addUserSchema>;

export function AddUserForm() {
  const createUser = useCreateUser();
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<AddUserValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { username: '', password: '', role: 'user' },
  });

  const onSubmit = handleSubmit((values) =>
    createUser
      .mutateAsync(values)
      .then(() => reset())
      .catch((error: unknown) => {
        if (isApiError(error, 409)) setError('username', { message: 'That username is taken' });
        else applyServerErrors(setError, error, ['username', 'password', 'role']);
      }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5" aria-labelledby="add-user-title">
      <h2 id="add-user-title" className="eyebrow">
        Add someone
      </h2>
      <TextField
        label="Username"
        hint="3–32"
        autoComplete="off"
        autoCapitalize="none"
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
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <ToggleGroup
            type="single"
            aria-label="Role"
            value={field.value}
            onValueChange={(value) => value && field.onChange(value)}
            className="gap-1"
          >
            {(['user', 'admin'] as const).map((role) => (
              <ToggleGroupItem
                key={role}
                value={role}
                className="h-8 rounded-full! border border-input px-3.5 capitalize data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {role}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      />
      {errors.root?.server && <FormAlert>{errors.root.server.message}</FormAlert>}
      <Button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating…' : 'Create account'}
      </Button>
      <p className="text-xs leading-normal text-subtle">
        There's no invite email. Share the password with them yourself.
      </p>
    </form>
  );
}
