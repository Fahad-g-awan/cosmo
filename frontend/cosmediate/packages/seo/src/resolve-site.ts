import {
  getOriginFromHeaders,
  inspectRequestHost,
  isPublicIndexableHost,
  type CosmediateTld,
} from "@cosmediate/config";
import type { MessageLocale } from "@cosmediate/i18n";
import {
  LOCALHOST_LOCALE_TLD,
  resolveHreflang,
  resolveHtmlLang,
  resolveMessageLocale,
  resolveOgLocale,
} from "@cosmediate/i18n/locales";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";

export type SeoAppKind = "web" | "blog" | "auth" | "app";

export interface SiteContext {
  app: SeoAppKind;
  origin: string;
  hostname: string;
  /** True when search engines may index this host (prod web/blog only). */
  indexable: boolean;
  /** Detected market TLD; null on localhost / unknown hosts. */
  tld: CosmediateTld | null;
  /** Message bundle key for SEO copy. */
  messageLocale: MessageLocale;
  /** BCP 47 hreflang for the current host. */
  hreflang: string;
  /** Value for `<html lang>`. */
  htmlLang: string;
  /** Open Graph locale (e.g. nl_NL). */
  ogLocale: string;
  isDev: boolean;
}

function resolveIndexable(app: SeoAppKind, hostname: string): boolean {
  if (app === "auth" || app === "app") {
    return false;
  }

  if (process.env.NODE_ENV === "development") {
    return false;
  }

  return isPublicIndexableHost(hostname);
}

export function resolveSiteContextFromHostname(
  app: SeoAppKind,
  hostname: string,
  origin: string,
): SiteContext {
  const hostInfo = inspectRequestHost(hostname);
  const localeTld = hostInfo.isLocalhost ? LOCALHOST_LOCALE_TLD : hostInfo.tld;

  return {
    app,
    origin,
    hostname,
    indexable: resolveIndexable(app, hostname),
    tld: hostInfo.tld,
    messageLocale: resolveMessageLocale(localeTld),
    hreflang: resolveHreflang(localeTld),
    htmlLang: resolveHtmlLang(localeTld),
    ogLocale: resolveOgLocale(localeTld),
    isDev: hostInfo.isDev,
  };
}

export function resolveSiteContextFromRequest(
  app: SeoAppKind,
  request: NextRequest,
): SiteContext {
  const hostname = request.headers.get("x-forwarded-host")?.split(":")[0]
    ?? request.nextUrl.host.split(":")[0]
    ?? "";
  const origin = getOriginFromHeaders(request.headers);
  return resolveSiteContextFromHostname(app, hostname, origin);
}

/** Resolve site context in Server Components, layouts, and metadata routes. */
export async function resolveSiteContext(
  app: SeoAppKind,
): Promise<SiteContext> {
  const headerStore = await headers();
  const hostHeader =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost";
  const hostname = hostHeader.split(":")[0] ?? "localhost";
  const origin = getOriginFromHeaders(headerStore);

  return resolveSiteContextFromHostname(app, hostname, origin);
}
