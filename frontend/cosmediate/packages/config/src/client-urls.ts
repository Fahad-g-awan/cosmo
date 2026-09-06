import { getDomain, getSubdomain } from "tldts";
import type { NextRequest } from "next/server";

import {
  APP_PORTS,
  APP_SUBDOMAINS,
  COSMEDIATE_TLDS,
  type ClientApp,
  type CosmediateTld,
} from "./tlds";

const STRIP_TRAILING_SLASH = /\/+$/;

/**
 * Resolve the request's external origin, honouring proxy headers.
 *
 * Vercel and other edge networks rewrite `Host` to an internal hostname
 * but expose the real public host via `x-forwarded-host` / `-proto`.
 *
 * Examples:
 * - https://app.cosmediate.com
 * - https://dev.blog.cosmediate.nl
 * - http://localhost:3000
 */
export function getOrigin(request: NextRequest): string {
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.nextUrl.host;
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol;
  const proto = forwardedProto.replace(/:$/, "");
  return `${proto}://${forwardedHost}`;
}

/**
 * Hostname of the incoming request (after proxy rewrites).
 *
 * Examples:
 * - "app.cosmediate.com"
 * - "dev.blog.cosmediate.nl"
 * - "localhost"
 */
export function getRequestHostname(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  return (forwardedHost ?? request.nextUrl.host).split(":")[0] ?? "";
}

export interface RequestHostInfo {
  isLocalhost: boolean;
  isDev: boolean;
  tld: CosmediateTld | null;
  apex: string | null;
}

const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

/**
 * Inspect hostname and extract environment + domain info.
 *
 * Examples:
 * - "localhost" →
 *   { isLocalhost: true, isDev: false, tld: null, apex: null }
 *
 * - "dev.app.cosmediate.com" →
 *   { isLocalhost: false, isDev: true, tld: "com", apex: "cosmediate.com" }
 *
 * - "blog.cosmediate.nl" →
 *   { isLocalhost: false, isDev: false, tld: "nl", apex: "cosmediate.nl" }
 *
 * - "randomdomain.xyz" →
 *   { isLocalhost: false, isDev: false, tld: null, apex: "randomdomain.xyz" }
 */
export function inspectRequestHost(hostname: string): RequestHostInfo {
  if (LOCALHOST_HOSTS.has(hostname) || hostname.endsWith(".local")) {
    return { isLocalhost: true, isDev: false, tld: null, apex: null };
  }

  const apex = getDomain(hostname);
  const subdomain = getSubdomain(hostname) ?? "";
  const tldPart = apex?.split(".").pop() ?? null;
  const tld =
    tldPart && (COSMEDIATE_TLDS as readonly string[]).includes(tldPart)
      ? (tldPart as CosmediateTld)
      : null;

  return {
    isLocalhost: false,
    isDev: subdomain.startsWith("dev"),
    tld,
    apex,
  };
}

/**
 * Resolve the public URL of a sibling client app for the *current* request.
 *
 * Examples (with `apex = cosmediate.nl`):
 * - `getClientAppUrl("blog", req)` → `https://blog.cosmediate.nl`
 * - `getClientAppUrl("app",  req)` → `https://app.cosmediate.nl`
 * - `getClientAppUrl("web",  req)` → `https://cosmediate.nl`
 *
 * On localhost, falls back to the dev port from `APP_PORTS`.
 *
 * If the request host is on an unknown TLD (i.e. not in
 * `COSMEDIATE_TLDS`), falls back to `cosmediate.com` rather than
 * trusting the foreign domain — we never want to emit
 * `https://app.someoneelses-domain.xyz`.
 *
 * Dev:
 * - "dev.app.cosmediate.com" → "https://dev.blog.cosmediate.com"
 *
 * Localhost:
 * - "http://localhost:3001" (based on APP_PORTS)
 */
/**
 * Same URL rules as {@link getClientAppUrl} but keyed only by hostname (browser
 * or any caller without a `NextRequest`). Used by footer/nav shortcuts client-side.
 */
export function getClientAppUrlFromHostname(
  hostname: string,
  app: ClientApp,
): string {
  const bare = hostname.split(":")[0] ?? hostname;
  const info = inspectRequestHost(bare);

  if (info.isLocalhost) {
    return `http://localhost:${APP_PORTS[app]}`;
  }

  // Gate on `tld` (whitelist), NOT `apex` — `getDomain()` happily returns
  // a registrable domain for any host, including non-Cosmediate ones.
  const apex = info.tld ? `cosmediate.${info.tld}` : "cosmediate.com";
  const sub = APP_SUBDOMAINS[app];
  const devPrefix = info.isDev ? "dev." : "";
  const host = sub ? `${devPrefix}${sub}.${apex}` : `${devPrefix}${apex}`;
  return `https://${host}`;
}

export function getClientAppUrl(app: ClientApp, request: NextRequest): string {
  return getClientAppUrlFromHostname(getRequestHostname(request), app);
}

/**
 * Build the auth callback URL for the current request — i.e. the
 * `redirect_uri` we send to the IdP on `/oauth/authorize`.
 *
 * Path env var defers rename (today: `AUTH_REDIRECT_PATH`).
 *
 * Examples (with `AUTH_REDIRECT_PATH="/auth/processing"`):
 * - https://app.cosmediate.com/auth/processing
 * - https://dev.app.cosmediate.nl/auth/processing
 * - http://localhost:3000/auth/processing
 */
/**
 * Whether a hostname should be indexed by search engines.
 * Blocks localhost, dev.* subdomains, and unknown hosts used in local tooling.
 */
export function isPublicIndexableHost(hostname: string): boolean {
  const bare = hostname.split(":")[0] ?? hostname;
  const info = inspectRequestHost(bare);
  return !info.isLocalhost && !info.isDev;
}

/**
 * Resolve the public origin from proxy-aware request headers (App Router).
 */
export function getOriginFromHeaders(headers: Headers): string {
  const host =
    headers.get("x-forwarded-host") ?? headers.get("host") ?? "localhost";
  const proto = (headers.get("x-forwarded-proto") ?? "http").replace(/:$/, "");
  return `${proto}://${host}`;
}

export function getAuthCallbackUrl(request: NextRequest): string {
  const raw = process.env.AUTH_REDIRECT_PATH ?? "/auth/processing";
  const trimmed = raw.replace(STRIP_TRAILING_SLASH, "");
  const path = trimmed.startsWith("/") ? trimmed : "/" + trimmed;
  return getOrigin(request) + path;
}
