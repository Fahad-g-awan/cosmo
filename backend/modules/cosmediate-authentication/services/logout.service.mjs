import {
  rethrowOrInternal,
  httpError,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import { GlobalSignOutCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { AUTH_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { cognitoIDP } from "/opt/nodejs/lib/auth/cognito-idp.client.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import {
  getSessionByUserIdFromDB,
  getSessionFromDB,
} from "/opt/nodejs/services/dynamodb/session.mjs";
import { sessionIdsFromAuthContext } from "/opt/nodejs/lib/auth/authorization/session-auth.mjs";

import { deleteSession } from "../lib/session.mjs";

/**
 * Resolve the single active DDB session for logout (cookie id first, then user GSI).
 *
 * @param {{ tableName: string, sessionId?: string | null, identityId?: string | null }} params
 * @returns {Promise<object | null>}
 */
const resolveSessionForLogout = async ({
  tableName,
  sessionId,
  identityId,
}) => {
  if (sessionId) {
    const byId = await getSessionFromDB(tableName, sessionId);
    if (byId) return byId;
  }

  if (identityId) {
    return getSessionByUserIdFromDB(tableName, identityId);
  }

  return null;
};

/**
 * Cognito global sign-out, hard-delete the DynamoDB session, return Hosted UI logout URL.
 *
 * @param {object} ctx
 * @returns {Promise<{ statusCode: number, data: object }>}
 */
export const handleLogout = async (ctx) => {
  try {
    const { config, authToken, authContext, sessionId } = ctx;

    if (!authToken) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["User has invalid credentials", API_ERRORS.AUTH_TOKEN],
      });
    }

    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.AUTH.LOGOUT,
      ctx.reqBody,
    );

    await cognitoIDP.send(new GlobalSignOutCommand({ AccessToken: authToken }));

    const { identityId } = sessionIdsFromAuthContext(authContext);
    const session = await resolveSessionForLogout({
      tableName: config.DDB_AUTH_TABLE_NAME,
      sessionId,
      identityId,
    });

    if (session?.PK && session?.SK) {
      try {
        await deleteSession({
          tableName: config.DDB_AUTH_TABLE_NAME,
          PK: session.PK,
          SK: session.SK,
        });
      } catch (deleteError) {
        // Cognito sign-out already succeeded — do not fail logout on DDB cleanup.
        console.error("[auth] logout session delete failed", deleteError);
      }
    }

    const logoutUrl = `${config.COGNITO_DOMAIN}/logout?client_id=${
      config.COGNITO_CLIENT_ID
    }&logout_uri=${encodeURIComponent(reqBody.redirectUri)}`;

    return {
      statusCode: 200,
      data: {
        success: true,
        message: "Logout successful",
        status: AUTH_STATUS.LOGOUT_SUCCESS,
        logoutUrl,
      },
    };
  } catch (error) {
    console.error("[auth] logout", error);
    rethrowOrInternal(error);
  }
};
