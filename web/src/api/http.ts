import { session } from '@/lib/session';

// Empty string = same origin. Nest serves this app in production and Vite
// proxies `/api` in dev, so relative URLs work in both. Set VITE_API_BASE only
// to point a dev build at a Cyra server running somewhere else.
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? '';
export const API_PREFIX = `${API_BASE}/api/v1`;

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
  }
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  return error instanceof ApiError && (status === undefined || error.status === status);
}

export function apiUrl(path: string, query?: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const search = params.toString();
  return `${API_PREFIX}${path}${search ? `?${search}` : ''}`;
}

async function readErrorMessages(response: Response): Promise<string[]> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message;
    if (body.message) return [body.message];
  } catch {
    // Non-JSON error body; fall through to the status text.
  }
  return [response.statusText || `Request failed with status ${response.status}`];
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body } = options;
  const token = session.getToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(apiUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, ["Can't reach the Cyra server"]);
  }

  // Any 401 on an authenticated call means the token is no longer valid:
  // expired, revoked by a password change, or the user was deleted.
  if (response.status === 401 && token) session.end('expired');

  if (!response.ok) throw new ApiError(response.status, await readErrorMessages(response));

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * Stream URL for a media file. `<video>` can't send an Authorization header,
 * so the token goes in the query string. The result is absolute so it also
 * works when copied into an external player like VLC.
 */
export function streamUrl(fileId: number): string {
  const path = apiUrl(`/files/${fileId}/stream`, { token: session.getToken() });
  return new URL(path, window.location.origin).href;
}
