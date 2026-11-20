import type { components } from './schema';

// Empty string = same origin. Nest serves this app in production and Vite
// proxies `/api` in dev, so relative URLs work in both. Set VITE_API_BASE only
// to point a dev build at a Cyra server running somewhere else.
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? '';
export const API_PREFIX = `${API_BASE}/api/v1`;

// Generated from docs/openapi.json by `npm run gen:api`.
export type Schemas = components['schemas'];

// /health has no response schema in the OpenAPI doc, so it is typed by hand.
export interface HealthResponse {
  status: string;
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_PREFIX}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json() as Promise<HealthResponse>;
}

/**
 * Stream URL for a media file. `<video>` can't send an Authorization header,
 * so the token goes in the query string. The result is absolute so it also
 * works when copied into an external player like VLC.
 */
export function streamUrl(fileId: number, token: string): string {
  const path = `${API_PREFIX}/files/${fileId}/stream?token=${encodeURIComponent(token)}`;
  return new URL(path, window.location.origin).href;
}
