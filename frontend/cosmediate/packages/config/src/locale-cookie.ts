/** Shared locale codes for UI + auth handoff (matches `@cosmediate/i18n`). */
export type LocaleCode = "en" | "nl" | "de" | "fr" | "it" | "el";

export const LOCALE_COOKIE_NAME = "cosmediate_locale";

const LOCALE_CODES = new Set<LocaleCode>([
  "en",
  "nl",
  "de",
  "fr",
  "it",
  "el",
]);

const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALE_CODES.has(value as LocaleCode);
}

function getClientHostname(): string | null {
  if (typeof window === "undefined") return null;
  return window.location.hostname.split(":")[0] ?? window.location.hostname;
}

/**
 * Cookie domain for locale persistence.
 * Only `*.cosmediate.com` shares with `auth.cosmediate.com`; market TLDs use host-only cookies.
 */
export function getLocaleCookieDomain(hostname: string): string | undefined {
  const bare = hostname.split(":")[0] ?? hostname;
  if (LOCALHOST_HOSTS.has(bare) || bare.endsWith(".local")) {
    return undefined;
  }
  if (bare === "cosmediate.com" || bare.endsWith(".cosmediate.com")) {
    return ".cosmediate.com";
  }
  return undefined;
}

function buildLocaleCookieAttributes(hostname: string): string {
  const parts = [
    "path=/",
    `max-age=${ONE_YEAR_SECONDS}`,
    "SameSite=Lax",
  ];
  const domain = getLocaleCookieDomain(hostname);
  if (domain) {
    parts.push(`domain=${domain}`);
  }
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

/** Persist locale on the current market host (and `.cosmediate.com` when applicable). */
export function setLocaleCookieClient(locale: LocaleCode): void {
  if (typeof document === "undefined") return;
  const hostname = getClientHostname();
  if (!hostname) return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; ${buildLocaleCookieAttributes(hostname)}`;
}

/** Read locale cookie on the current host (browser only). */
export function getLocaleCookieClient(): LocaleCode | null {
  if (typeof document === "undefined") return null;
  const prefix = `${LOCALE_COOKIE_NAME}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      const value = trimmed.slice(prefix.length);
      return isLocaleCode(value) ? value : null;
    }
  }
  return null;
}

export function appendLocaleToUrl(
  url: string,
  locale: LocaleCode | null | undefined,
): string {
  if (!locale) return url;
  const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://cosmediate.com");
  parsed.searchParams.set("locale", locale);
  return parsed.toString();
}

/** Best-effort locale from Accept-Language header (auth fallback). */
export function resolveLocaleFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
): LocaleCode | null {
  if (!acceptLanguage) return null;
  const lower = acceptLanguage.toLowerCase();
  const priority: LocaleCode[] = ["nl", "de", "fr", "it", "el", "en"];
  for (const code of priority) {
    if (code === "en") continue;
    if (lower.includes(code)) return code;
  }
  return null;
}

export function readLocaleFromCookieHeader(
  cookieHeader: string | null | undefined,
): LocaleCode | null {
  if (!cookieHeader) return null;
  const prefix = `${LOCALE_COOKIE_NAME}=`;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      const value = trimmed.slice(prefix.length);
      return isLocaleCode(value) ? value : null;
    }
  }
  return null;
}
