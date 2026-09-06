import { NextRequest, NextResponse } from "next/server";

import {
  clearClientSessionCookies,
  CLIENT_SESSION_COOKIE,
} from "./auth-cookies";
import { shouldRefreshAccessToken } from "./refresh-lead";
import { fetchSameOriginSessionRefresh } from "./session-refresh-fetch";

/**
 * Dashboard: authenticated surface — missing/expired session → `/auth/signin`.
 * Public: clear stale cookies, continue.
 */
export type ProxySessionGateMode = "dashboard" | "public";

export interface ProxySessionGateOptions {
  mode: ProxySessionGateMode;
}

const STATIC_ASSET_PATTERN = /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/;

/**
 * Paths that must never run the session gate (API, Next internals, assets).
 */
export function shouldBypassProxyInfrastructure(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    STATIC_ASSET_PATTERN.test(pathname)
  );
}

/**
 * OAuth exchange landing + client `/auth/signin` redirect — always `next()` before session gate.
 */
export function shouldBypassProxyAuthFlow(pathname: string): boolean {
  return (
    pathname.startsWith("/auth/processing") ||
    pathname.startsWith("/auth/signin")
  );
}

function redirectToSignin(
  request: NextRequest,
  returnTo: string,
): NextResponse {
  const signInUrl = new URL("/auth/signin", request.url);
  signInUrl.searchParams.set("return_to", returnTo);
  return NextResponse.redirect(signInUrl);
}

function rejectSession(
  request: NextRequest,
  mode: ProxySessionGateMode,
  returnTo: string,
): NextResponse {
  if (mode === "dashboard") {
    const res = redirectToSignin(request, returnTo);
    clearClientSessionCookies(res);
    return res;
  }
  const next = NextResponse.next();
  clearClientSessionCookies(next);
  return next;
}

/**
 * Scalar cookie gate + single same-origin refresh attempt (`POST /api/auth/refresh`).
 * Refreshes inside the shared 15-minute lead window (same as client silent auth).
 * Caller must run shortcuts, static skips, and `/auth/*` passthrough first.
 */
export async function runProxySessionGate(
  request: NextRequest,
  options: ProxySessionGateOptions,
): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const returnTo = pathname + search;
  const { mode } = options;

  const accessToken = request.cookies.get(
    CLIENT_SESSION_COOKIE.ACCESS_TOKEN,
  )?.value;
  const tokenExpRaw = request.cookies.get(
    CLIENT_SESSION_COOKIE.TOKEN_EXP,
  )?.value;
  const refreshExpRaw = request.cookies.get(
    CLIENT_SESSION_COOKIE.REFRESH_EXP,
  )?.value;

  const hasSession =
    Boolean(accessToken) && tokenExpRaw !== undefined && tokenExpRaw !== "";

  if (!hasSession) {
    if (mode === "dashboard") {
      return redirectToSignin(request, returnTo);
    }
    return NextResponse.next();
  }

  let expiresAt: number | undefined;
  if (tokenExpRaw !== undefined && tokenExpRaw !== "") {
    const n = Number(tokenExpRaw);
    if (Number.isFinite(n)) expiresAt = Math.trunc(n);
  }

  let refreshExpiresAt: number | undefined;
  if (refreshExpRaw !== undefined && refreshExpRaw !== "") {
    const n = Number(refreshExpRaw);
    if (Number.isFinite(n)) refreshExpiresAt = Math.trunc(n);
  }

  const now = Math.floor(Date.now() / 1000);

  const needsRefresh = shouldRefreshAccessToken({
    accessTokenExpiresAt: expiresAt,
    refreshTokenExpiresAt: refreshExpiresAt,
    nowSeconds: now,
  });

  // Access already expired (or missing exp) and refresh window also gone → reject.
  if ((!expiresAt || now > expiresAt) && !needsRefresh) {
    return rejectSession(request, mode, returnTo);
  }

  if (needsRefresh) {
    const refreshed = await fetchSameOriginSessionRefresh(request);
    if (refreshed.ok) {
      const next = NextResponse.next();
      for (const line of refreshed.setCookieHeaders) {
        next.headers.append("Set-Cookie", line);
      }
      return next;
    }

    // Only force sign-in when access is already expired; otherwise let the
    // page load and let client silent auth / axios retry.
    if (!expiresAt || now > expiresAt) {
      return rejectSession(request, mode, returnTo);
    }
  }

  if (mode === "dashboard" && pathname === "/signin") {
    const rootUrl = new URL("/", request.url);
    return NextResponse.redirect(rootUrl);
  }

  return NextResponse.next();
}
