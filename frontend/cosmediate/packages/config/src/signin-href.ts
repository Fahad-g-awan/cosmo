import type { AuthErrorCode } from "@cosmediate/type-utils";

import { safePostAuthRedirect } from "./auth-cookies";
import type { LocaleCode } from "./locale-cookie";

/**
 * Paths where marketing `return_to` should collapse to `/` (avoid OAuth bounce loops).
 */
export function isOAuthLandingPath(pathname: string): boolean {
  return (
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/processing") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/processing") ||
    pathname.startsWith("/confirm-signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  );
}

/**
 * Header “Sign in”: attach `return_to` from the current URL unless the user is
 * already on IdP/auth chrome (`/` avoids loops).
 */
export function buildMarketingSignInHref(
  signInPath: string,
  pathname: string,
  searchQueryString: string,
  locale?: LocaleCode | null,
): string {
  const pathWithQuery =
    searchQueryString.length > 0
      ? `${pathname}?${searchQueryString}`
      : pathname;

  const returnTo = isOAuthLandingPath(pathname)
    ? "/"
    : safePostAuthRedirect(pathWithQuery);

  const qs = new URLSearchParams({ return_to: returnTo });
  if (locale) qs.set("locale", locale);
  return `${signInPath}?${qs.toString()}`;
}

/**
 * After `/auth/processing` (or IdP `/processing`) fails, “Back to sign in” must
 * sometimes restart OAuth **without** echoing `return_to`:
 *
 * - **Omit** when the failure indicates a broken / invalid handshake or bad
 *   deploy config — sending the user back to their article URL first only sends
 *   them through sign-in again with stale intent and feels like a loop.
 * - **Preserve** when failure is likely transient (expired code, generic 500)
 *   or session-shaped — retry should land them where they originally clicked
 *   “Sign in”.
 *
 * Open redirects are guarded via {@link safePostAuthRedirect}.
 */
export function shouldOmitReturnToOnProcessingRecovery(
  errorCode: AuthErrorCode | "unknown",
): boolean {
  switch (errorCode) {
    case "missing_auth_code":
    case "invalid_request":
    case "invalid_grant":
    case "invalid_client":
    case "unsupported_grant_type":
    case "server_misconfig":
      return true;
    default:
      return false;
  }
}

/**
 * Builds `/auth/signin` or IdP `/signin` URL after processing-page failure.
 *
 * @param oauthReturnToFromSearchParams — `return_to` query on the processing
 *   landing URL (IdP echoes it when redirecting with `code`).
 */
export function buildProcessingRecoverySignInHref(
  signInPath: string,
  errorCode: AuthErrorCode | "unknown",
  oauthReturnToFromSearchParams: string | null,
  locale?: LocaleCode | null,
): string {
  if (shouldOmitReturnToOnProcessingRecovery(errorCode)) {
    if (locale) {
      const qs = new URLSearchParams({ locale });
      return `${signInPath}?${qs.toString()}`;
    }
    return signInPath;
  }

  const raw = oauthReturnToFromSearchParams?.trim();
  if (!raw) {
    if (locale) {
      const qs = new URLSearchParams({ locale });
      return `${signInPath}?${qs.toString()}`;
    }
    return signInPath;
  }

  const safe = safePostAuthRedirect(raw);
  const qs = new URLSearchParams({ return_to: safe });
  if (locale) qs.set("locale", locale);
  return `${signInPath}?${qs.toString()}`;
}
