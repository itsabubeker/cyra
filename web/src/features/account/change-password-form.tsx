import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FormAlert } from '@/components/shared/form-alert';
import { TextField } from '@/components/shared/text-field';
import { isApiError } from '@/api/http';
import { useChangePassword } from '@/features/auth/api';
import { changePasswordSchema, type ChangePasswordValues } from '@/features/auth/schemas';
import { applyServerErrors } from '@/lib/errors';

export function ChangePasswordForm() {
  const [pending, setPending] = useState<ChangePasswordValues | null>(null);
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  const submit = (values: ChangePasswordValues) =>
    changePassword
      .mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      .catch((error: unknown) => {
        if (isApiError(error, 403)) setError('currentPassword', { message: 'Current password is wrong' });
        else applyServerErrors(setError, error, ['currentPassword', 'newPassword']);
      });

  return (
    <form onSubmit={handleSubmit(setPending)} noValidate className="flex max-w-md flex-col gap-5">
      <h2 className="display text-[32px]">Change password</h2>
      <TextField
        label="Current"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <TextField
        label="New"
        hint="8–128"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <TextField
        label="Confirm"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <FormAlert tone="warning">You'll be signed out on every device, including this one.</FormAlert>
      {errors.root?.server && <FormAlert>{errors.root.server.message}</FormAlert>}
      <Button type="submit" size="lg" className="self-start" disabled={changePassword.isPending}>
        {changePassword.isPending ? 'Changing…' : 'Change password'}
      </Button>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change your password?</AlertDialogTitle>
            <AlertDialogDescription>
              Every device signed in to this account, including this one, will be signed out. You'll sign in again with
              the new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) void submit(pending);
                setPending(null);
              }}
            >
              Change password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
