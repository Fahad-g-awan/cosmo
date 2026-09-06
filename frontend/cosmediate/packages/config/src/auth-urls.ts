/**
 * Auth IdP URL helpers.
 *
 * **Naming**: `AUTH_PROVIDER_URL` / `AUTH_SELF_URL` are **origins** (no path).
 * Configurable route suffixes like `/api/auth/token` are **endpoints** (path-only).
 * Helpers named `getAuth*Url()` return a **full URL** = origin + endpoint.
 *
 * The auth IdP is `.com`-centralized — there is no per-TLD auth host
 * (decision A10 + M3, master plan §2). Therefore these helpers are
 * fully driven by the `AUTH_PROVIDER_URL` env var (clients) or
 * `AUTH_SELF_URL` env var (the auth app itself, master plan §13.7).
 *
 * IdP path overrides: **`AUTH_APP_*_ENDPOINT`** only. If unset or empty,
 * each helper uses the default path documented on that function.
 *
 * Callers MUST be in a server context (`process.env` is required).
 */

const STRIP_TRAILING_SLASH = /\/+$/;

function resolveAuthAppEndpoint(
  envKey: string,
  defaultEndpoint: string
): string {
  const v = process.env[envKey];
  if (v !== undefined && v !== "") return v;
  return defaultEndpoint;
}

function readAuthProviderUrl(): string {
  const raw = process.env.AUTH_PROVIDER_URL;
  if (!raw) {
    throw new Error(
      "[@cosmediate/config] AUTH_PROVIDER_URL is not set. " +
        "Client apps must declare this env var (master plan §13.7)."
    );
  }
  return raw.replace(STRIP_TRAILING_SLASH, "");
}

function readAuthSelfUrl(): string {
  const raw = process.env.AUTH_SELF_URL;
  if (!raw) {
    throw new Error(
      "[@cosmediate/config] AUTH_SELF_URL is not set. " +
        "The auth IdP app must declare this env var (master plan §13.7)."
    );
  }
  return raw.replace(STRIP_TRAILING_SLASH, "");
}

/**
 * URL of the auth IdP, as seen by client apps.
 *
 * Use this in client BFF routes to talk to the IdP server-to-server,
 * to build sign-in / authorize redirect URLs, and as the base for the
 * cross-origin clear-session endpoint.
 */
export function getAuthProviderUrl(): string {
  return readAuthProviderUrl();
}

/**
 * URL of the auth IdP as seen by itself (used inside `apps/auth`).
 *
 * Different env var on purpose — the auth app does NOT know it's an
 * auth provider; that name only makes sense from a client's perspective.
 */
export function getAuthSelfUrl(): string {
  return readAuthSelfUrl();
}

/**
 * Sign-in page on the auth IdP. Used by `AuthProvider.handleLogout` and
 * the unauthorized-access redirect (master plan P9).
 */
export function getAuthSigninUrl(): string {
  return `${readAuthProviderUrl()}/signin`;
}

/**
 * Cross-origin clear-session redirect endpoint on the auth IdP.
 *
 * NOTE: must remain a `GET` redirect — it's invoked via
 * `window.location.href` for browser-driven cookie cleanup
 * (master plan §13.4 and §13.10).
 */
export function getAuthClearSessionUrl(): string {
  return `${readAuthProviderUrl()}/oauth/clear-session`;
}

/**
 * OAuth authorize URL on the auth IdP (`GET`).
 * Override path: `AUTH_APP_AUTHORIZE_ENDPOINT` (default `/oauth/authorize`).
 */
export function getAuthAuthorizeUrl(): string {
  const endpoint = resolveAuthAppEndpoint(
    "AUTH_APP_AUTHORIZE_ENDPOINT",
    "/oauth/authorize"
  );
  return `${readAuthProviderUrl()}${endpoint}`;
}

/**
 * Token-exchange URL on the auth IdP (`POST`).
 * Override path: `AUTH_APP_TOKEN_ENDPOINT` (default `/api/auth/token`).
 */
export function getAuthTokenUrl(): string {
  const endpoint = resolveAuthAppEndpoint(
    "AUTH_APP_TOKEN_ENDPOINT",
    "/api/auth/token"
  );
  return `${readAuthProviderUrl()}${endpoint}`;
}

/**
 * Logout URL on the auth IdP (`POST`).
 * Override path: `AUTH_APP_LOGOUT_ENDPOINT` (default `/api/auth/logout`).
 */
export function getAuthLogoutUrl(): string {
  const endpoint = resolveAuthAppEndpoint(
    "AUTH_APP_LOGOUT_ENDPOINT",
    "/api/auth/logout"
  );
  return `${readAuthProviderUrl()}${endpoint}`;
}

/**
 * Refresh URL on the auth IdP (`POST`).
 * Override path: `AUTH_APP_REFRESH_ENDPOINT` (default `/api/auth/refresh`).
 */
export function getAuthRefreshUrl(): string {
  const endpoint = resolveAuthAppEndpoint(
    "AUTH_APP_REFRESH_ENDPOINT",
    "/api/auth/refresh"
  );
  return `${readAuthProviderUrl()}${endpoint}`;
}
