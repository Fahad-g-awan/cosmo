/** Refresh access token when ≤15 minutes remain before expiry. */
export const REFRESH_LEAD_SECONDS = 15 * 60;

/**
 * Whether the access token should be refreshed now (proactive lead or already expired),
 * while the app-level refresh window is still valid.
 */
export function shouldRefreshAccessToken(options: {
  accessTokenExpiresAt?: number;
  refreshTokenExpiresAt?: number;
  nowSeconds?: number;
  leadSeconds?: number;
}): boolean {
  const {
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    nowSeconds = Math.floor(Date.now() / 1000),
    leadSeconds = REFRESH_LEAD_SECONDS,
  } = options;

  if (!accessTokenExpiresAt || !refreshTokenExpiresAt) {
    return false;
  }

  if (nowSeconds >= refreshTokenExpiresAt) return false;

  return nowSeconds >= accessTokenExpiresAt - leadSeconds;
}
