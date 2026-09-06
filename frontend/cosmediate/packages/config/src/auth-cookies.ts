import type { NextResponse } from "next/server";

/** Scalar cookie payload for IdP + clients (no redirect fields). */
export type ScalarSessionCookiePayload = {
  session_id: string;
  access_token: string;
  token_exp: number;
  refresh_exp: number;
  identity_id: string;
  profile_id: string;
  user_role: string;
};

/** Client apps (`web` / `app` / `blog`) — Phase 6 scalar cookies */
export const CLIENT_SESSION_COOKIE = {
  SESSION_ID: "cos_session_id",
  IDENTITY_ID: "cos_identity_id",
  PROFILE_ID: "cos_profile_id",
  USER_ROLE: "cos_user_role",
  ACCESS_TOKEN: "cos_access_token",
  TOKEN_EXP: "cos_token_exp",
  REFRESH_EXP: "cos_refresh_exp",
} as const;

/** Auth IdP — mirrors client scalars with `cos_idp_*` prefix */
export const IDP_SESSION_COOKIE = {
  SESSION_ID: "cos_idp_session_id",
  IDENTITY_ID: "cos_idp_identity_id",
  PROFILE_ID: "cos_idp_profile_id",
  USER_ROLE: "cos_idp_user_role",
  ACCESS_TOKEN: "cos_idp_access_token",
  TOKEN_EXP: "cos_idp_token_exp",
  REFRESH_EXP: "cos_idp_refresh_exp",
} as const;

export function sessionCookieAttributes(): {
  httpOnly: boolean;
  sameSite: "lax";
  path: string;
  secure: boolean;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
}

export interface OAuthTokenSuccessPayload extends ScalarSessionCookiePayload {
  return_to?: string;
  /** Safe relative path for client navigation after exchange (server-derived). */
  redirect_to: string;
}

export function parseOAuthTokenSuccessPayload(
  body: unknown,
): OAuthTokenSuccessPayload | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const session_id = o.session_id;
  const access_token = o.access_token;
  const token_exp = o.token_exp;
  const refresh_exp = o.refresh_exp;
  const identity_id = o.identity_id;
  const profile_id_raw = o.profile_id;
  const user_role = o.user_role;
  const return_to_raw = o.return_to;
  const return_to =
    typeof return_to_raw === "string" ? return_to_raw : undefined;
  const redirect_to_raw = o.redirect_to;

  if (
    typeof session_id !== "string" ||
    typeof access_token !== "string" ||
    typeof identity_id !== "string" ||
    typeof user_role !== "string" ||
    (profile_id_raw !== undefined &&
      profile_id_raw !== null &&
      typeof profile_id_raw !== "string")
  ) {
    return null;
  }

  const profile_id =
    typeof profile_id_raw === "string"
      ? profile_id_raw
      : profile_id_raw === null
        ? ""
        : "";

  const te =
    typeof token_exp === "number"
      ? token_exp
      : typeof token_exp === "string"
        ? Number(token_exp)
        : NaN;
  const re =
    typeof refresh_exp === "number"
      ? refresh_exp
      : typeof refresh_exp === "string"
        ? Number(refresh_exp)
        : NaN;
  if (!Number.isFinite(te) || !Number.isFinite(re)) return null;

  const redirect_to = safePostAuthRedirect(
    typeof redirect_to_raw === "string"
      ? redirect_to_raw
      : return_to !== undefined
        ? return_to
        : "/",
  );

  return {
    session_id,
    access_token,
    token_exp: Math.trunc(te),
    refresh_exp: Math.trunc(re),
    identity_id,
    profile_id,
    user_role,
    redirect_to,
    ...(return_to !== undefined ? { return_to } : {}),
  };
}

/** Safe relative path after OAuth exchange — rejects open redirects. */
export function safePostAuthRedirect(returnTo: unknown): string {
  if (typeof returnTo !== "string") return "/";
  const t = returnTo.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/";
  return t.length > 2048 ? "/" : t;
}

export function setClientSessionCookies(
  response: NextResponse,
  p: ScalarSessionCookiePayload,
): void {
  const base = sessionCookieAttributes();
  response.cookies.set(CLIENT_SESSION_COOKIE.SESSION_ID, p.session_id, base);
  response.cookies.set(CLIENT_SESSION_COOKIE.IDENTITY_ID, p.identity_id, base);
  response.cookies.set(CLIENT_SESSION_COOKIE.PROFILE_ID, p.profile_id, base);
  response.cookies.set(CLIENT_SESSION_COOKIE.USER_ROLE, p.user_role, base);
  response.cookies.set(
    CLIENT_SESSION_COOKIE.ACCESS_TOKEN,
    p.access_token,
    base,
  );
  response.cookies.set(
    CLIENT_SESSION_COOKIE.TOKEN_EXP,
    String(p.token_exp),
    base,
  );
  response.cookies.set(
    CLIENT_SESSION_COOKIE.REFRESH_EXP,
    String(p.refresh_exp),
    base,
  );
}

export function clearClientSessionCookies(response: NextResponse): void {
  for (const name of Object.values(CLIENT_SESSION_COOKIE)) {
    response.cookies.delete(name);
  }
}

export function clearIdpSessionCookies(response: NextResponse): void {
  for (const name of Object.values(IDP_SESSION_COOKIE)) {
    response.cookies.delete(name);
  }
}

export function setIdpSessionCookies(
  response: NextResponse,
  p: ScalarSessionCookiePayload,
): void {
  const base = sessionCookieAttributes();
  response.cookies.set(IDP_SESSION_COOKIE.SESSION_ID, p.session_id, base);
  response.cookies.set(IDP_SESSION_COOKIE.IDENTITY_ID, p.identity_id, base);
  response.cookies.set(IDP_SESSION_COOKIE.PROFILE_ID, p.profile_id, base);
  response.cookies.set(IDP_SESSION_COOKIE.USER_ROLE, p.user_role, base);
  response.cookies.set(IDP_SESSION_COOKIE.ACCESS_TOKEN, p.access_token, base);
  response.cookies.set(IDP_SESSION_COOKIE.TOKEN_EXP, String(p.token_exp), base);
  response.cookies.set(
    IDP_SESSION_COOKIE.REFRESH_EXP,
    String(p.refresh_exp),
    base,
  );
}

/** OAuth handshake cookies on the IdP (not session scalars). */
export const IDP_FLOW_COOKIE_NAMES = [
  "cos_oauth_code",
  "client_auth_ctx",
] as const;

export function clearIdpFlowCookies(response: NextResponse): void {
  for (const name of IDP_FLOW_COOKIE_NAMES) {
    response.cookies.delete(name);
  }
}

/** Clears IdP session scalars + OAuth flow cookies. */
export function clearAllIdpAuthCookies(response: NextResponse): void {
  clearIdpSessionCookies(response);
  clearIdpFlowCookies(response);
}
