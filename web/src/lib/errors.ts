import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError, isApiError } from '@/api/http';

export function errorMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  if (error instanceof Error) return [error.message];
  return ['Something went wrong'];
}

export function errorMessage(error: unknown): string {
  return errorMessages(error).join('. ');
}

export function tmdbErrorMessage(error: unknown): string {
  return isApiError(error, 502) ? 'TMDB is unavailable right now, try again shortly.' : errorMessage(error);
}

/**
 * Puts server validation messages on the form field they mention
 * (class-validator messages start with the property name) and collects
 * the rest under `root.server`.
 */
export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: unknown,
  fields: Path<T>[],
) {
  const unmatched: string[] = [];
  for (const message of errorMessages(error)) {
    const field = fields.find((name) => message.toLowerCase().startsWith(name.toLowerCase()));
    if (field) setError(field, { message });
    else unmatched.push(message);
  }
  if (unmatched.length > 0) setError('root.server', { message: unmatched.join('. ') });
}
