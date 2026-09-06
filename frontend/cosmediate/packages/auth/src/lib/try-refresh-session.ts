import type { SessionTokens, UserRole } from "@cosmediate/type-utils";
import {
  REFRESH_LEAD_SECONDS,
  shouldRefreshAccessToken,
} from "@cosmediate/config";

import {
  notifySessionTokensUpdated,
  type SessionTokenSnapshot,
} from "./session-token-sync";

export { REFRESH_LEAD_SECONDS };

export type TryRefreshSessionResult =
  | { ok: true }
  | { ok: false; reason: "rejected" | "network" };

let refreshInFlight: Promise<TryRefreshSessionResult> | null = null;

export function shouldProactivelyRefresh(
  tokens: SessionTokens | undefined,
): boolean {
  return shouldRefreshAccessToken({
    accessTokenExpiresAt: tokens?.accessTokenExpiresAt,
    refreshTokenExpiresAt: tokens?.refreshTokenExpiresAt,
  });
}

type GetSessionPayload = {
  authenticated?: boolean;
  session?: {
    sessionId: string;
    identityId: string;
    profileId: string | null;
    userRole: UserRole;
    tokens: SessionTokens;
  } | null;
};

async function fetchSessionSnapshot(): Promise<SessionTokenSnapshot | null> {
  try {
    const res = await fetch("/api/auth/get-session", {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as GetSessionPayload;
    if (!data.authenticated || !data.session?.tokens?.accessToken) {
      return null;
    }

    return {
      sessionId: data.session.sessionId,
      identityId: data.session.identityId,
      profileId: data.session.profileId,
      userRole: data.session.userRole,
      tokens: data.session.tokens,
    };
  } catch {
    return null;
  }
}

/**
 * Deduped same-origin `POST /api/auth/refresh`.
 * Updates `cos_*` cookies via the client BFF; notifies AuthContext listeners on success.
 */
export async function tryRefreshSession(): Promise<TryRefreshSessionResult> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async (): Promise<TryRefreshSessionResult> => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        return {
          ok: false,
          reason: res.status >= 500 ? "network" : "rejected",
        };
      }

      const snapshot = await fetchSessionSnapshot();
      if (snapshot) {
        notifySessionTokensUpdated(snapshot);
      }

      return { ok: true };
    } catch (err) {
      console.warn("[tryRefreshSession] refresh request failed", err);
      return { ok: false, reason: "network" };
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/** Reads the current access token from `GET /api/auth/get-session` after refresh. */
export async function fetchAccessTokenFromSession(): Promise<string | null> {
  const snapshot = await fetchSessionSnapshot();
  return snapshot?.tokens.accessToken ?? null;
}
