import {
  ResendConfirmationCodeCommand,
  AdminInitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  USER_STATUS,
  AUTH_STATUS,
} from "/opt/nodejs/constants/auth/status.constants.mjs";
import { resolveCognitoUsernameByEmailAndSub } from "/opt/nodejs/services/auth/cognito-linking.mjs";
import { calculateSecretHash } from "/opt/nodejs/lib/auth/crypto/cognito-secret-hash.utils.mjs";
import { generateSessionId } from "/opt/nodejs/lib/auth/crypto/session.utils.mjs";
import { cognitoIDP } from "/opt/nodejs/lib/auth/cognito-idp.client.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { resolveUnconfirmedSignupCognitoUsername } from "../lib/cognito-verification.mjs";
import { logAuthSignIn } from "../lib/auth-compliance.service.mjs";
import { sendResponse } from "../lib/signin-response.mjs";
import { findIdentityByEmail } from "../lib/identity.mjs";
import { storeSession } from "../lib/session.mjs";

/**
 * Email + password sign-in. Users are provisioned with a permanent Cognito password.
 */
export const nativeSignIn = async (context, { email, password }) => {
  const { config } = context;
  const { user: foundUser } = await findIdentityByEmail(
    config.POSTGRES_DB_URL,
    email,
  );

  if (!foundUser) {
    throw httpError({
      error: API_ERRORS.USER_NOT_FOUND,
      details: [`User does not exists: ${email}`, "Please signup first"],
    });
  }

  if (foundUser?.status === USER_STATUS.UNCONFIRMED) {
    try {
      const cognitoUsername = await resolveUnconfirmedSignupCognitoUsername(
        config,
        foundUser,
      );
      await cognitoIDP.send(
        new ResendConfirmationCodeCommand({
          ClientId: config.COGNITO_CLIENT_ID,
          Username: cognitoUsername,
          SecretHash: calculateSecretHash(
            cognitoUsername,
            config.COGNITO_CLIENT_ID,
            config.COGNITO_CLIENT_SECRET,
          ),
        }),
      );

      return {
        statusCode: 200,
        data: {
          success: false,
          error: API_ERRORS.USER_UNCONFIRMED.code,
          message: `Account not verified. A new verification code has been sent to your email: ${email}`,
          status: AUTH_STATUS.RESEND_CONF_CODE,
          email,
          requiresVerification: true,
          details: [
            `Please verify your account before proceeding to signin: ${email}`,
            "If code is lost or expired then please proceed to signup to get new verification code at your email.",
          ],
        },
      };
    } catch (resendError) {
      console.error("[auth] resend confirmation on sign-in", resendError);
      throw httpError({
        error: API_ERRORS.USER_UNCONFIRMED,
        details: [
          `Please verify your account before proceeding to signin: ${email}`,
          "Unable to resend verification code. Please try signing up again.",
        ],
      });
    }
  }

  if (foundUser?.status === USER_STATUS.BLOCKED) {
    throw httpError({
      error: API_ERRORS.USER_BLOCKED,
      details: [
        `User is blocked: ${email}`,
        "Please contact support.",
      ],
    });
  }

  const cognitoResolved = await resolveCognitoUsernameByEmailAndSub(
    config,
    foundUser.email,
    foundUser.cognitoSub,
  );
  if (!cognitoResolved.ok) {
    if (cognitoResolved.reason === "ambiguous") {
      throw httpError({
        error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
        details: [
          "Multiple Cognito users match this email. Contact support to fix account linkage.",
        ],
      });
    }
    throw httpError({
      error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
      details: [
        `No Cognito password user matches your account (${email}). Sign in with your linked social provider first, then set a password — or contact support.`,
      ],
    });
  }

  const cognitoUsername = cognitoResolved.username;

  const resp = await cognitoIDP.send(
    new AdminInitiateAuthCommand({
      AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
      ClientId: config.COGNITO_CLIENT_ID,
      UserPoolId: config.COGNITO_USER_POOL_ID,
      AuthParameters: {
        USERNAME: cognitoUsername,
        PASSWORD: password,
        SECRET_HASH: calculateSecretHash(
          cognitoUsername,
          config.COGNITO_CLIENT_ID,
          config.COGNITO_CLIENT_SECRET,
        ),
      },
    }),
  );

  if (resp?.ChallengeName) {
    console.error("[auth] sign-in: unexpected Cognito challenge", {
      challengeName: resp.ChallengeName,
      email,
    });
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: [
        "Sign-in could not be completed. Contact support if this persists.",
      ],
    });
  }

  const authTokens = resp?.AuthenticationResult;
  if (!authTokens) {
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: ["Sign-in could not be completed."],
    });
  }

  const { IdToken, AccessToken, RefreshToken, ExpiresIn } = authTokens;
  const sessionId = generateSessionId();

  await storeSession({
    PK: `IDP_SESSION#USER#${foundUser.id}`,
    SK: "METADATA",
    tableName: config.DDB_AUTH_TABLE_NAME,
    accessToken: AccessToken,
    refreshToken: RefreshToken,
    idToken: IdToken,
    expiresIn: ExpiresIn,
    sessionId,
    user: foundUser,
    tokenRefreshMode: "native",
    cognitoUsername,
  });

  await logAuthSignIn({
    tableName: config.DDB_MAIN_TABLE_NAME,
    databaseUrl: config.POSTGRES_DB_URL,
    identity: foundUser,
    logData: { method: "native" },
  });

  return sendResponse({
    accessToken: AccessToken,
    sessionId,
    idToken: IdToken,
    expiresIn: ExpiresIn,
    user: foundUser,
  });
};
