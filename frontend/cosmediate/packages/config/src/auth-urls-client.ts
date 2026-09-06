/**
 * Browser-side IdP URLs for hard redirects (`window.location`).
 *
 * Prefer **`NEXT_PUBLIC_AUTH_PROVIDER_URL`** when it differs from the dev/prod
 * defaults below. Server routes continue using **`AUTH_PROVIDER_URL`** /
 * **`getAuthProviderUrl()`** in `auth-urls.ts`.
 */

import { getSubdomain } from "tldts";

import {
  appendLocaleToUrl,
  getLocaleCookieClient,
  type LocaleCode,
} from "./locale-cookie";

const STRIP_TRAILING_SLASH = /\/+$/;

/** Centralized IdP host (master plan M3 / AGENTS §13). */
const DEFAULT_AUTH_PROVIDER_ORIGIN = "https://auth.cosmediate.com";
const DEV_AUTH_PROVIDER_ORIGIN = "https://dev.auth.cosmediate.com";

const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function stripTrailingSlash(origin: string): string {
  return origin.replace(STRIP_TRAILING_SLASH, "");
}

function isDevClientHostname(hostname: string): boolean {
  const bare = hostname.split(":")[0] ?? hostname;
  if (LOCALHOST_HOSTS.has(bare) || bare.endsWith(".local")) return false;
  const subdomain = getSubdomain(bare) ?? "";
  return subdomain.startsWith("dev");
}

export function getAuthProviderOriginClient(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AUTH_PROVIDER_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      LOCALHOST_HOSTS.has(host) ||
      host === "127.0.0.1" ||
      host.endsWith(".local")
    ) {
      return "http://localhost:3002";
    }

    if (isDevClientHostname(host)) {
      return DEV_AUTH_PROVIDER_ORIGIN;
    }
  }

  return DEFAULT_AUTH_PROVIDER_ORIGIN;
}

export function getAuthClearSessionUrlClient(): string {
  return `${getAuthProviderOriginClient()}/oauth/clear-session`;
}

export function buildAuthClearSessionUrlClient(success?: string): string {
  const url = new URL(getAuthClearSessionUrlClient());
  if (success) {
    url.searchParams.set("success", success);
  }
  return url.toString();
}

export function getAuthSigninUrlClient(locale?: LocaleCode): string {
  const resolvedLocale = locale ?? getLocaleCookieClient() ?? undefined;
  return appendLocaleToUrl(
    `${getAuthProviderOriginClient()}/signin`,
    resolvedLocale,
  );
}

/** IdP hosted sign-up page (`apps/auth` `/signup`). */
export function getAuthSignupUrlClient(locale?: LocaleCode): string {
  const resolvedLocale = locale ?? getLocaleCookieClient() ?? undefined;
  return appendLocaleToUrl(
    `${getAuthProviderOriginClient()}/signup`,
    resolvedLocale,
  );
}
