import {
  ChangePasswordCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  AdminResetUserPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import {
  resolveCognitoUsernameByEmailAndSub,
  getLinkedProviderSlugsForPoolUsername,
  resolveFederatedLinkSource,
  cognitoTryLinkProviderToNative,
} from "/opt/nodejs/services/auth/cognito-linking.mjs";
import {
  USER_STATUS,
  AUTH_STATUS,
} from "/opt/nodejs/constants/auth/status.constants.mjs";
import { calculateSecretHash } from "/opt/nodejs/lib/auth/crypto/cognito-secret-hash.utils.mjs";
import { generateDefaultPassword } from "/opt/nodejs/lib/auth/crypto/password.utils.mjs";
import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { resolveIdentityDisplayName } from "/opt/nodejs/services/dynamodb/activity-feed.utils.mjs";
import { cognitoGetUserByAccessToken } from "/opt/nodejs/lib/auth/cognito/oauth.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { generateSessionId } from "/opt/nodejs/lib/auth/crypto/session.utils.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { cognitoIDP } from "/opt/nodejs/lib/auth/cognito-idp.client.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  requirePasswordAuthContext,
  assertSelf,
  loadIdentityForPassword,
  assertIdentityActiveForPassword,
  assertSessionMatchesIdentity,
  assertPasswordSet,
  requireNativeCognitoUsername,
} from "../lib/password-guards.mjs";
import {
  normalizeVerificationCode,
  throwCognitoConfirmationCodeError,
  throwCognitoForgotPasswordError,
  assertCognitoUserConfirmedForPasswordReset,
} from "../lib/cognito-verification.mjs";
import {
  clearDefaultPasswordIfUsed,
  pivotIdentityOauthNativePassword,
} from "../lib/identity-updates.mjs";
import {
  cognitoSubFromAdminUser,
  mintNativeTokensAfterPasswordSet,
} from "../lib/password-cognito.mjs";
import { sendPasswordChangedEmail } from "../lib/transactional-emails.mjs";
import { authActorFromContext } from "../lib/auth-actor.mjs";
import { sendResponse } from "../lib/signin-response.mjs";
import { storeSession } from "../lib/session.mjs";

const SCOPE_FOR_ROLE = {
  PATIENT: ENTITY_TYPE.PATIENT,
  ADMIN: ENTITY_TYPE.ADMIN,
  SPECIALIST: ENTITY_TYPE.SPECIALIST,
  MANAGER: ENTITY_TYPE.CLINIC_MANAGER,
};

const logPasswordMutation = async ({
  tableName,
  databaseUrl,
  authContext,
  action,
  identity,
  logData = {},
}) => {
  const displayName = await resolveIdentityDisplayName(
    databaseUrl,
    identity,
    logData,
  );

  return recordComplianceLogs(tableName, {
    authActor: authActorFromContext({
      ...authContext,
      fullName: displayName || authContext?.fullName,
    }),
    logData: {
      id: identity?.entityId ?? logData?.id,
      identityId: identity?.id,
      email: identity?.email ?? logData?.email,
      fullName: displayName || logData?.fullName,
      ...logData,
    },
    action,
    scope: SCOPE_FOR_ROLE[identity?.role] ?? ENTITY_TYPE.PATIENT,
    targetEntityId: identity?.entityId ?? logData?.id ?? "",
    targetName: displayName || logData?.fullName || "",
  });
};

const logPasswordUpdate = (params) =>
  logPasswordMutation({ ...params, action: AUDIT_LOG_ACTION.PASSWORD_UPDATE });

const logPasswordSet = (params) =>
  logPasswordMutation({ ...params, action: AUDIT_LOG_ACTION.PASSWORD_SET });

/**
 * Update the password for a user
 *
 * @param {Object} ctx - The context object
 * @param {Object} ctx.config - The configuration object
 * @param {Object} ctx.authToken - The authentication token
 * @param {Object} ctx.reqBody - The request body
 * @returns {Promise<Object>} - The response object
 */
export const updatePassword = async (ctx) => {
  const authContext = requirePasswordAuthContext(ctx);
  const { config, authToken } = ctx;

  const { value: reqBody } = await validateRequestBody(
    CRUD_ACTIONS.AUTH.UPDATE_PASSWORD,
    ctx.reqBody,
  );

  const { userId, email, oldPassword, newPassword } = reqBody;

  assertSelf(authContext, userId);

  const identity = await loadIdentityForPassword(ctx, { email, userId });
  assertSessionMatchesIdentity(authContext, identity);
  assertIdentityActiveForPassword(identity, email);
  assertPasswordSet(identity, { flow: "change" });

  try {
    await cognitoIDP.send(
      new ChangePasswordCommand({
        AccessToken: authToken,
        PreviousPassword: oldPassword,
        ProposedPassword: newPassword,
      }),
    );
  } catch (cognitoError) {
    const errName = cognitoError?.name || cognitoError?.code || "";

    if (errName === "NotAuthorizedException") {
      throw httpError({
        error: API_ERRORS.INCORRECT_PASSWORD,
        details: ["Current password is incorrect"],
      });
    }

    if (errName === "InvalidPasswordException") {
      throw httpError({
        error: API_ERRORS.VALIDATION_ERROR,
        details: [
          `/newPassword ${
            cognitoError?.message ||
            "Password must contain uppercase, lowercase, number, and special character"
          }`,
        ],
      });
    }

    if (errName === "LimitExceededException" || errName === "TooManyRequestsException") {
      throw httpError({
        error: API_ERRORS.TOO_MANY_REQUESTS,
        details: [
          "Too many attempts. Please wait a moment before trying again.",
        ],
      });
    }

    throw cognitoError;
  }

  if (identity.defaultPasswordUsed) {
    await clearDefaultPasswordIfUsed(identity);
  }

  await logPasswordUpdate({
    tableName: config.DDB_MAIN_TABLE_NAME,
    databaseUrl: config.POSTGRES_DB_URL,
    authContext,
    identity,
    logData: { id: userId, email },
  });

  await sendPasswordChangedEmail({
    config,
    databaseUrl: config.POSTGRES_DB_URL,
    identity,
    logData: { id: userId, email },
  });

  return {
    statusCode: 200,
    data: {
      success: true,
      message: "Password updated successfully, please signin again",
      requiredSignin: true,
      status: AUTH_STATUS.PASSWORD_UPDATED,
    },
  };
};

/**
 * OAuth-first scenario: create/link native pool user, set password, pivot Identity to native `cognitoSub`,
 * return native JWT bundle (replaces prior OAuth-only session). Self-only.
 */
export const setNewPassword = async (ctx) => {
  const authContext = requirePasswordAuthContext(ctx);
  const { config, authToken } = ctx;

  const { value: reqBody } = await validateRequestBody(
    CRUD_ACTIONS.AUTH.SET_NEW_PASSWORD,
    ctx.reqBody,
  );
  const { userId, email, password } = reqBody;

  assertSelf(authContext, userId);

  const identity = await loadIdentityForPassword(ctx, { email, userId });
  assertSessionMatchesIdentity(authContext, identity);
  assertIdentityActiveForPassword(identity, email);

  if (identity.passwordSet) {
    throw httpError({
      error: API_ERRORS.PASSWORD_ALREADY_SET,
      details: [
        "Password is already configured for this account. Use sign-in or change password instead.",
      ],
    });
  }

  let cognitoResolved = await resolveCognitoUsernameByEmailAndSub(
    config,
    identity.email,
    identity.cognitoSub,
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

    const tokenUser = await cognitoGetUserByAccessToken(config, authToken);

    const tiEmail = String(tokenUser.email || "")
      .trim()
      .toLowerCase();
    if (tiEmail && tiEmail !== identity.email.toLowerCase()) {
      throw httpError({
        error: API_ERRORS.EMAIL_MISMATCH,
        details: [
          "Bearer token email does not match the account being updated.",
        ],
      });
    }

    if (String(tokenUser.sub || "") !== identity.cognitoSub) {
      throw httpError({
        error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
        details: [
          "OAuth session does not match this Identity. Use the linked social sign-in for this account.",
        ],
      });
    }

    let oauthAdminOut;
    try {
      oauthAdminOut = await cognitoIDP.send(
        new AdminGetUserCommand({
          UserPoolId: config.COGNITO_USER_POOL_ID,
          Username: tokenUser.username,
        }),
      );
    } catch (e) {
      console.error("[auth] setNewPassword AdminGetUser federated", e);
      throw httpError({
        error: API_ERRORS.INTERNAL_ERROR,
        details: ["Failed to read Cognito user for linking.", e?.message ?? ""],
      });
    }

    const { providerName, providerSub } = resolveFederatedLinkSource(
      oauthAdminOut,
      tokenUser.username,
    );

    if (!providerName || !providerSub) {
      throw httpError({
        error: API_ERRORS.OAUTH_PROVIDER_UNRESOLVED,
        details: [
          "Could not resolve federated identity for linking. Contact support.",
        ],
      });
    }

    const poolEmailUsername = identity.email;

    try {
      const tempPw = generateDefaultPassword();
      await cognitoIDP.send(
        new AdminCreateUserCommand({
          UserPoolId: config.COGNITO_USER_POOL_ID,
          Username: poolEmailUsername,
          MessageAction: "SUPPRESS",
          TemporaryPassword: tempPw,
          UserAttributes: [
            { Name: "email", Value: poolEmailUsername },
            { Name: "email_verified", Value: "true" },
            { Name: "preferred_username", Value: poolEmailUsername },
          ],
        }),
      );
    } catch (e) {
      if (e?.name !== "UsernameExistsException") {
        console.error("[auth] setNewPassword AdminCreateUser", e);
        throw httpError({
          error: API_ERRORS.INTERNAL_ERROR,
          details: ["Failed to create native Cognito user.", e?.message ?? ""],
        });
      }
    }

    let nativeAdminOut;
    try {
      nativeAdminOut = await cognitoIDP.send(
        new AdminGetUserCommand({
          UserPoolId: config.COGNITO_USER_POOL_ID,
          Username: poolEmailUsername,
        }),
      );
    } catch (e) {
      console.error("[auth] setNewPassword AdminGetUser native", e);
      throw httpError({
        error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
        details: [
          "Native Cognito user was not created for this email. Try again later or contact support.",
        ],
      });
    }

    const nativeSub = cognitoSubFromAdminUser(nativeAdminOut);

    if (!nativeSub) {
      throw httpError({
        error: API_ERRORS.INTERNAL_ERROR,
        details: ["Cognito native user missing `sub`."],
      });
    }

    if (nativeSub !== tokenUser.sub) {
      await cognitoTryLinkProviderToNative(config, {
        nativeUserSub: nativeSub,
        providerName,
        providerSub,
      });
    }

    cognitoResolved = await resolveCognitoUsernameByEmailAndSub(
      config,
      identity.email,
      nativeSub,
    );

    if (!cognitoResolved.ok) {
      if (cognitoResolved.reason === "ambiguous") {
        throw httpError({
          error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
          details: [
            "Multiple Cognito users match this email after linking. Contact support.",
          ],
        });
      }
      throw httpError({
        error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
        details: [
          "Could not resolve native Cognito username after linking. Contact support.",
        ],
      });
    }
  }

  const cognitoUsername = cognitoResolved.username;

  await cognitoIDP.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: config.COGNITO_USER_POOL_ID,
      Username: cognitoUsername,
      Password: password,
      Permanent: true,
    }),
  );

  const linkedSlugs = await getLinkedProviderSlugsForPoolUsername(
    config,
    cognitoUsername,
  );

  if (!linkedSlugs?.length) {
    throw httpError({
      error: API_ERRORS.OAUTH_PROVIDER_UNRESOLVED,
      details: [
        "Could not read linkedProviders from Cognito after password set.",
      ],
    });
  }

  const nativeProfilePostSet = await cognitoIDP.send(
    new AdminGetUserCommand({
      UserPoolId: config.COGNITO_USER_POOL_ID,
      Username: cognitoUsername,
    }),
  );
  const finalizedSub =
    cognitoSubFromAdminUser(nativeProfilePostSet) ?? identity.cognitoSub;

  const refreshedIdentity = await pivotIdentityOauthNativePassword({
    userId: identity.id,
    cognitoSub: finalizedSub,
    linkedProviders: linkedSlugs,
  });

  const { AccessToken, RefreshToken, IdToken, ExpiresIn } =
    await mintNativeTokensAfterPasswordSet(ctx, cognitoUsername, password);

  const sessionId = generateSessionId();

  await storeSession({
    PK: `IDP_SESSION#USER#${refreshedIdentity.id}`,
    SK: "METADATA",
    tableName: config.DDB_AUTH_TABLE_NAME,
    accessToken: AccessToken,
    refreshToken: RefreshToken,
    idToken: IdToken,
    expiresIn: ExpiresIn,
    sessionId,
    user: { ...refreshedIdentity, sub: refreshedIdentity.cognitoSub },
    tokenRefreshMode: "native",
    cognitoUsername,
  });

  await logPasswordSet({
    tableName: config.DDB_MAIN_TABLE_NAME,
    databaseUrl: config.POSTGRES_DB_URL,
    authContext,
    identity: refreshedIdentity,
    logData: { id: userId, email, oauthPivot: true },
  });

  await sendPasswordChangedEmail({
    config,
    databaseUrl: config.POSTGRES_DB_URL,
    identity: refreshedIdentity,
    logData: { id: userId, email },
  });

  const base = sendResponse({
    accessToken: AccessToken,
    sessionId,
    idToken: IdToken,
    expiresIn: ExpiresIn,
    user: refreshedIdentity,
  });

  return {
    statusCode: 201,
    data: {
      ...base.data,
      message: "Password set successfully. Native session issued.",
      requiredSignin: false,
      status: AUTH_STATUS.PASSWORD_UPDATED,
    },
  };
};

/**
 * Forgot password flow for a user to send a reset code to the user's email
 *
 * @param {Object} ctx - The context object
 * @param {Object} ctx.config - The configuration object
 * @param {Object} ctx.reqBody - The request body
 * @returns {Promise<Object>} - The response object
 */
export const forgotPassword = async (ctx) => {
  const { config } = ctx;
  const { value: reqBody } = await validateRequestBody(
    CRUD_ACTIONS.AUTH.FORGOT_PASSWORD,
    ctx.reqBody,
  );
  const { email } = reqBody;

  const identity = await loadIdentityForPassword(ctx, { email });

  if (identity?.status === USER_STATUS.UNCONFIRMED) {
    throw httpError({
      error: API_ERRORS.USER_UNCONFIRMED,
      details: [
        `Please verify your account before proceeding to signin: ${email}`,
        "If code is lost or expired then please proceed to signup to get new verification code at your email.",
      ],
    });
  }
  if (identity?.status === USER_STATUS.BLOCKED) {
    throw httpError({
      error: API_ERRORS.USER_BLOCKED,
      details: [`User is blocked: ${email}`, "Please contact admin."],
    });
  }

  assertPasswordSet(identity, { flow: "reset" });

  const cognitoUsername = await requireNativeCognitoUsername(
    config,
    identity,
    email,
    {
      missingDetail: `No Cognito password user matches this account (${email}). Sign in with your linked provider or contact support.`,
    },
  );

  await assertCognitoUserConfirmedForPasswordReset(
    config,
    cognitoUsername,
    email,
  );

  console.info("[auth] forgot password", {
    email: identity.email,
    cognitoUsername,
    identityId: identity.id,
  });

  try {
    await cognitoIDP.send(
      new AdminResetUserPasswordCommand({
        UserPoolId: config.COGNITO_USER_POOL_ID,
        Username: cognitoUsername,
      }),
    );
  } catch (cognitoError) {
    console.error("[auth] forgot password cognito", cognitoError);
    throwCognitoForgotPasswordError(cognitoError, email);
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      message: `Password reset code sent at ${email}`,
      status: AUTH_STATUS.CONF_CODE_SENT,
    },
  };
};

/**
 * Reset password flow for a user to reset their password
 *
 * @param {Object} ctx - The context object
 * @param {Object} ctx.config - The configuration object
 * @param {Object} ctx.reqBody - The request body
 * @returns {Promise<Object>} - The response object
 */
export const resetPassword = async (ctx) => {
  const { config } = ctx;
  const { value: reqBody } = await validateRequestBody(
    CRUD_ACTIONS.AUTH.RESET_PASSWORD,
    ctx.reqBody,
  );

  const { email, code, newPassword } = reqBody;
  const confirmationCode = normalizeVerificationCode(code);

  const identity = await loadIdentityForPassword(ctx, { email });
  assertIdentityActiveForPassword(identity, email);
  assertPasswordSet(identity, { flow: "reset" });

  const cognitoUsername = await requireNativeCognitoUsername(
    config,
    identity,
    email,
    {
      missingDetail: `No Cognito user matches your account (${email}). Request a new reset code.`,
    },
  );

  console.info("[auth] reset password", {
    email: identity.email,
    cognitoUsername,
    identityId: identity.id,
    codeLength: confirmationCode.length,
  });

  const secretHash = calculateSecretHash(
    cognitoUsername,
    config.COGNITO_CLIENT_ID,
    config.COGNITO_CLIENT_SECRET,
  );

  try {
    await cognitoIDP.send(
      new ConfirmForgotPasswordCommand({
        ClientId: config.COGNITO_CLIENT_ID,
        Username: cognitoUsername,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
        SecretHash: secretHash,
      }),
    );
  } catch (cognitoError) {
    console.error("[auth] reset password", cognitoError);
    throwCognitoConfirmationCodeError(cognitoError, email, { flow: "reset" });
  }

  if (identity.defaultPasswordUsed) {
    await clearDefaultPasswordIfUsed(identity);
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      message: "Password reset successful, please signin",
      status: AUTH_STATUS.PASSWORD_RESET_SUCCESS,
    },
  };
};
