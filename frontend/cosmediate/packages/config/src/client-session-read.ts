import type { SessionTokens, UserRole } from "@cosmediate/type-utils";

import { CLIENT_SESSION_COOKIE } from "./auth-cookies";

export interface ClientSessionSnapshot {
  sessionId: string;
  identityId: string;
  profileId: string | null;
  userRole: UserRole;
  tokens: SessionTokens;
}

/** Reads Phase 6 `cos_*` client session cookies. */
export function readClientSessionSnapshot(
  get: (name: string) => string | undefined,
): ClientSessionSnapshot | null {
  const sid = get(CLIENT_SESSION_COOKIE.SESSION_ID);
  const identityId = get(CLIENT_SESSION_COOKIE.IDENTITY_ID);
  const profileIdRaw = get(CLIENT_SESSION_COOKIE.PROFILE_ID);
  const role = get(CLIENT_SESSION_COOKIE.USER_ROLE);
  const at = get(CLIENT_SESSION_COOKIE.ACCESS_TOKEN);
  const te = get(CLIENT_SESSION_COOKIE.TOKEN_EXP);
  const re = get(CLIENT_SESSION_COOKIE.REFRESH_EXP);

  if (
    !sid ||
    !identityId ||
    profileIdRaw === undefined ||
    !role ||
    !at ||
    te === undefined ||
    re === undefined
  ) {
    return null;
  }

  const token_exp = Number(te);
  const refresh_exp = Number(re);
  if (!Number.isFinite(token_exp) || !Number.isFinite(refresh_exp)) {
    return null;
  }

  return {
    sessionId: sid,
    identityId,
    profileId: profileIdRaw === "" ? null : profileIdRaw,
    userRole: role as UserRole,
    tokens: {
      accessToken: at,
      accessTokenExpiresAt: Math.trunc(token_exp),
      refreshTokenExpiresAt: Math.trunc(refresh_exp),
    },
  };
}
