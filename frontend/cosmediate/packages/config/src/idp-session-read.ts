import type { UserRole } from "@cosmediate/type-utils";

import { IDP_SESSION_COOKIE } from "./auth-cookies";

export interface IdpSessionSnapshot {
  session_id: string;
  identity_id: string;
  profile_id: string;
  user_role: UserRole;
  access_token: string;
  token_exp: number;
  refresh_exp: number;
}

/** Reads Phase 6 `cos_idp_*` IdP session cookies. */
export function readIdpSessionSnapshot(
  get: (name: string) => string | undefined,
): IdpSessionSnapshot | null {
  const sid = get(IDP_SESSION_COOKIE.SESSION_ID);
  const identityId = get(IDP_SESSION_COOKIE.IDENTITY_ID);
  const profileIdRaw = get(IDP_SESSION_COOKIE.PROFILE_ID);
  const role = get(IDP_SESSION_COOKIE.USER_ROLE);
  const at = get(IDP_SESSION_COOKIE.ACCESS_TOKEN);
  const te = get(IDP_SESSION_COOKIE.TOKEN_EXP);
  const re = get(IDP_SESSION_COOKIE.REFRESH_EXP);

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
    session_id: sid,
    identity_id: identityId,
    profile_id: profileIdRaw,
    user_role: role as UserRole,
    access_token: at,
    token_exp: Math.trunc(token_exp),
    refresh_exp: Math.trunc(refresh_exp),
  };
}
