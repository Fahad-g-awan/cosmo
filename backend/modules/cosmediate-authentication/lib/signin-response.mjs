import { DateTime } from "luxon";

/** App-level refresh window (30 days), aligned with `storeSession`. */
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Build the standard auth session success payload for clients / BFFs.
 *
 * @param {object} params
 * @param {string} params.accessToken
 * @param {string} params.sessionId
 * @param {string} [params.idToken]
 * @param {number} [params.expiresIn]
 * @param {number | null} [params.expiresAt]
 * @param {number | null} [params.refreshTokenExpiresAt] Stored DDB value when available
 * @param {object} [params.user]
 * @param {string} [params.message]
 * @returns {{ statusCode: number, data: object }}
 */
export const sendResponse = ({
  accessToken,
  sessionId,
  idToken,
  expiresIn,
  expiresAt = null,
  refreshTokenExpiresAt = null,
  user,
  message = "User signed in successfully",
}) => {
  const now = Math.floor(DateTime.now().toSeconds());
  const resolvedRefreshExpiresAt =
    typeof refreshTokenExpiresAt === "number" && refreshTokenExpiresAt > 0
      ? refreshTokenExpiresAt
      : now + REFRESH_TOKEN_MAX_AGE_SECONDS;

  const identityId = user?.id ?? null;
  const profileId = user?.entityId ?? null;
  const role = user?.role ?? null;

  return {
    statusCode: 200,
    data: {
      success: true,
      message,
      sessionId,
      accessToken,
      refreshTokenExpiresAt: resolvedRefreshExpiresAt,
      accessTokenExpiresAt: expiresAt ?? now + expiresIn,
      identityId,
      profileId,
      role,
      user,
    },
  };
};
