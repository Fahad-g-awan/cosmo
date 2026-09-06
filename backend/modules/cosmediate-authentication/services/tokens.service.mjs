import { DateTime } from "luxon";

import {
  rethrowOrInternal,
  httpError,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import { getSessionFromDB } from "/opt/nodejs/services/dynamodb/session.mjs";
import {
  refreshViaNative,
  refreshViaOauth,
} from "/opt/nodejs/lib/auth/cognito/oauth.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";

import { findIdentityById } from "../lib/identity.mjs";
import { sendResponse } from "../lib/signin-response.mjs";
import { storeSession } from "../lib/session.mjs";

const identityIdFromSessionPk = (pk) => {
  const match = String(pk ?? "").match(/^IDP_SESSION#USER#(.+)$/);
  return match?.[1] ?? null;
};

const resolveSessionUser = async (config, session) => {
  if (session?.user?.id) {
    return session.user;
  }

  const identityId = identityIdFromSessionPk(session?.PK);
  if (!identityId) {
    return null;
  }

  const { user } = await findIdentityById(config.POSTGRES_DB_URL, identityId);
  return user ?? null;
};

const refreshSessionTokens = async (config, session) => {
  const refreshToken = session.refreshToken;
  const cognitoUsername =
    session.cognitoUsername ??
    session.sub ??
    session.user?.cognitoSub ??
    null;
  const mode = session.tokenRefreshMode;

  if (mode === "oauth") {
    return refreshViaOauth(config, refreshToken);
  }

  if (mode === "native") {
    return refreshViaNative(config, refreshToken, cognitoUsername);
  }

  try {
    return await refreshViaNative(config, refreshToken, cognitoUsername);
  } catch (nativeError) {
    console.warn(
      "[auth] legacy refresh native failed, trying oauth",
      nativeError?.message ?? nativeError,
    );
    return refreshViaOauth(config, refreshToken);
  }
};

export const refreshTokens = async (ctx) => {
  try {
    const now = Math.floor(DateTime.now().toSeconds());
    const { config, sessionId } = ctx;

    if (!sessionId) {
      throw httpError({
        error: API_ERRORS.INVALID_SESSION,
        message: "Invalid Request Body",
        details: ["Session ID not found.", "Please signin again."],
      });
    }

    const session = await getSessionFromDB(
      config.DDB_AUTH_TABLE_NAME,
      sessionId,
    );

    if (!session) {
      throw httpError({
        error: API_ERRORS.INVALID_SESSION,
        details: [`Session id is Invalid: ${sessionId}`],
      });
    }

    const refreshExpiresAt = Number(session.refreshTokenExpiresAt ?? 0);
    if (!refreshExpiresAt || refreshExpiresAt < now) {
      throw httpError({
        error: API_ERRORS.INVALID_SESSION,
        details: [
          `Refresh token has expired: ${sessionId}`,
          "Please signin again.",
        ],
      });
    }

    const resp = await refreshSessionTokens(config, session);
    const { access_token, id_token, expires_in } = resp;

    const user = await resolveSessionUser(config, session);
    const refreshToken = resp.refresh_token ?? session.refreshToken;

    const stored = await storeSession({
      PK: session.PK,
      SK: session.SK,
      tableName: config.DDB_AUTH_TABLE_NAME,
      accessToken: access_token,
      refreshToken,
      idToken: id_token,
      expiresIn: expires_in,
      sessionId,
      user,
      tokenRefreshMode: session.tokenRefreshMode,
      cognitoUsername: session.cognitoUsername,
    });

    return sendResponse({
      accessToken: access_token,
      sessionId,
      idToken: id_token,
      expiresIn: expires_in,
      expiresAt: stored?.expiresAt ?? null,
      refreshTokenExpiresAt:
        stored?.refreshTokenExpiresAt ?? session.refreshTokenExpiresAt ?? null,
      user,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    console.error("[auth] refresh tokens", error);
    rethrowOrInternal(error);
  }
};
