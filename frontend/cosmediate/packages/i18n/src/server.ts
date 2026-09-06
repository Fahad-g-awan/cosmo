import { headers, cookies } from "next/headers";

import {
  LOCALE_COOKIE_NAME,
  inspectRequestHost,
  isLocaleCode,
  readLocaleFromCookieHeader,
  resolveLocaleFromAcceptLanguage,
} from "@cosmediate/config";

import { LOCALHOST_LOCALE_TLD, resolveMessageLocale } from "./locales";
import type { MessageLocale, UiMessages } from "./types";
import { getUiMessages } from "./messages";

export type { LocaleContext } from "./context";
export { getSeoMessagesForContext, getUiMessagesForContext } from "./context";

/** Resolve UI message locale in Server Components, layouts, and metadata routes. */
export async function resolveLocaleFromHeaders(): Promise<MessageLocale> {
  const headerStore = await headers();
  const hostHeader =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost";
  const hostname = hostHeader.split(":")[0] ?? "localhost";
  const hostInfo = inspectRequestHost(hostname);
  const localeTld = hostInfo.isLocalhost ? LOCALHOST_LOCALE_TLD : hostInfo.tld;

  return resolveMessageLocale(localeTld);
}

export async function resolveUiMessagesFromHeaders(): Promise<{
  locale: MessageLocale;
  messages: UiMessages;
}> {
  const locale = await resolveLocaleFromHeaders();
  return {
    locale,
    messages: getUiMessages(locale),
  };
}

type LocaleSearchParams = {
  get: (key: string) => string | null;
};

/**
 * Auth IdP locale: `?locale=` → cookie → Accept-Language → `en`.
 * Used by `apps/auth` layout (not TLD-based).
 */
export async function resolveAuthLocale(
  searchParams?: LocaleSearchParams,
): Promise<MessageLocale> {
  const localeParam = searchParams?.get("locale");
  if (localeParam && isLocaleCode(localeParam)) {
    return localeParam;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieValue && isLocaleCode(cookieValue)) {
    return cookieValue;
  }

  const headerStore = await headers();
  const fromCookieHeader = readLocaleFromCookieHeader(
    headerStore.get("cookie"),
  );
  if (fromCookieHeader) {
    return fromCookieHeader;
  }

  const fromAccept = resolveLocaleFromAcceptLanguage(
    headerStore.get("accept-language"),
  );
  if (fromAccept) {
    return fromAccept;
  }

  return "en";
}
