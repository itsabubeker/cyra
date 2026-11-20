import { useSyncExternalStore } from 'react';

const TOKEN_KEY = 'cyra.accessToken';

export type SessionEndReason = 'expired' | 'password-changed' | 'signed-out';

type Listener = () => void;

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable (private mode); the session then lasts for this tab only.
  }
}

let token = readStoredToken();
let endReason: SessionEndReason | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const session = {
  getToken: () => token,

  start(accessToken: string) {
    token = accessToken;
    endReason = null;
    writeStoredToken(accessToken);
    emit();
  },

  end(reason: SessionEndReason) {
    if (!token) return;
    token = null;
    endReason = reason;
    writeStoredToken(null);
    emit();
  },

  getEndReason: () => endReason,

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSessionToken() {
  return useSyncExternalStore(session.subscribe, session.getToken);
}
