import type { SessionTokens, UserRole } from "@cosmediate/type-utils";

export type SessionTokenSnapshot = {
  sessionId: string;
  identityId: string;
  profileId: string | null;
  userRole: UserRole;
  tokens: SessionTokens;
};

type Listener = (snapshot: SessionTokenSnapshot) => void;

const listeners = new Set<Listener>();

/**
 * Subscribe to successful same-origin session refreshes so AuthContext
 * can keep in-memory tokens aligned with cookies.
 */
export function subscribeSessionTokensUpdated(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifySessionTokensUpdated(
  snapshot: SessionTokenSnapshot,
): void {
  for (const listener of listeners) {
    try {
      listener(snapshot);
    } catch (err) {
      console.warn("[session-token-sync] listener failed", err);
    }
  }
}
