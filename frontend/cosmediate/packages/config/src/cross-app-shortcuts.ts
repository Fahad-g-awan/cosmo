import type { NextRequest } from "next/server";

import { getClientAppUrlFromHostname, getRequestHostname } from "./client-urls";

function shortcutTargetFromHostname(
  hostname: string,
  pathname: string,
  search: string,
): string | null {
  if (pathname.startsWith("/home")) {
    const path = pathname.slice("/home".length) || "/";
    return `${getClientAppUrlFromHostname(hostname, "web")}${path}${search}`;
  }

  if (pathname.startsWith("/dashboard")) {
    const path = pathname.slice("/dashboard".length) || "/";
    return `${getClientAppUrlFromHostname(hostname, "app")}${path}${search}`;
  }

  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    const path =
      pathname === "/blog" ? "/" : pathname.slice("/blog".length) || "/";
    return `${getClientAppUrlFromHostname(hostname, "blog")}${path}${search}`;
  }

  return null;
}

/**
 * Browser-safe sibling-app URLs for `/home`, `/dashboard`, `/blog` shortcuts.
 * Mirrors {@link getCrossAppShortcutTargetUrl} (proxy middleware) using the
 * current hostname only — keeps footer/header marketing links aligned across
 * web ↔ blog ↔ app hosts (localhost ports + prod/dev subdomains).
 */
export function getCrossAppShortcutHrefFromHostname(
  hostname: string,
  options: { pathname: string; search: string },
): string | null {
  return shortcutTargetFromHostname(hostname, options.pathname, options.search);
}

/**
 * Cosmediate short-link routes (`/home` → public web, `/dashboard` → app,
 * `/blog` → blog), honoured on **every** Next.js app host including the IdP.
 *
 * Target URLs use the same rules as {@link getClientAppUrl}: localhost ports
 * from `APP_PORTS`, prod/dev subdomain patterns from `inspectHost`, unknown TLD
 * → fall back to `cosmediate.com` apex (never trust arbitrary preview domains).
 */
export function getCrossAppShortcutTargetUrl(
  request: NextRequest,
  options: { pathname: string; search: string },
): string | null {
  return getCrossAppShortcutHrefFromHostname(
    getRequestHostname(request),
    options,
  );
}
