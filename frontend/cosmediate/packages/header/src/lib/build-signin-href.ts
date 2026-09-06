/**
 * Client sign-in URL helpers for `@cosmediate/header`.
 *
 * Shared logic lives in `@cosmediate/config` (`buildMarketingSignInHref`,
 * `isOAuthLandingPath`).
 */

import {
  appendLocaleToUrl,
  buildMarketingSignInHref,
  getAuthSignupUrlClient,
  type LocaleCode,
} from "@cosmediate/config";

export function resolveSignInPath(origin: string): string {
  if (!origin) return "/auth/signin";
  return origin.includes("auth.") || origin.includes(":3002")
    ? "/signin"
    : "/auth/signin";
}

/**
 * Sign-up lives on the IdP (`/signup`). Client apps (web/blog/app) must use an
 * absolute IdP URL; only the auth deployment uses a same-origin `/signup`.
 */
export function resolveSignupHref(
  origin: string,
  locale?: LocaleCode | null,
): string {
  if (!origin) return getAuthSignupUrlClient(locale ?? undefined);
  if (origin.includes("auth.") || origin.includes(":3002")) {
    return locale
      ? appendLocaleToUrl("/signup", locale)
      : "/signup";
  }
  return getAuthSignupUrlClient(locale ?? undefined);
}

export function buildSignInHref(
  signInPath: string,
  pathname: string,
  searchQueryString: string,
  locale?: LocaleCode | null,
): string {
  return buildMarketingSignInHref(
    signInPath,
    pathname,
    searchQueryString,
    locale,
  );
}
