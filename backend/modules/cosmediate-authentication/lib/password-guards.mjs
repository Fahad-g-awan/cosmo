import { resolveCognitoUsernameByEmailAndSub } from "/opt/nodejs/services/auth/cognito-linking.mjs";
import { sessionIdsFromAuthContext } from "/opt/nodejs/lib/auth/authorization/session-auth.mjs";
import { USER_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { findIdentityByEmail } from "./identity.mjs";

export const requirePasswordAuthContext = (ctx) => {
  const { authToken, authContext } = ctx;
  const { cognitoSub, identityId } = sessionIdsFromAuthContext(authContext);
  const invalid =
    !authToken ||
    !cognitoSub ||
    !authContext?.email ||
    !identityId ||
    !authContext?.perms;

  if (invalid) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["User is not authorized to perform this action."],
    });
  }
  return authContext;
};

export const assertSelf = (authContext, targetUserId) => {
  const { identityId } = sessionIdsFromAuthContext(authContext);
  if (identityId !== targetUserId) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: [
        "Permission denied",
        "You can only perform this action on your own account",
      ],
    });
  }
};

export const loadIdentityForPassword = async (
  ctx,
  { email, userId = null },
) => {
  const { config } = ctx;
  const { user: identity } = await findIdentityByEmail(
    config.POSTGRES_DB_URL,
    email,
  );

  if (!identity) {
    throw httpError({
      error: API_ERRORS.USER_NOT_FOUND,
      details: [`User does not exists: ${email}`, "Please signup first"],
    });
  }

  if (userId && identity.id !== userId) {
    throw httpError({
      error: API_ERRORS.USER_NOT_FOUND,
      details: ["userId does not match email for this Identity."],
    });
  }

  return identity;
};

export const assertIdentityActiveForPassword = (identity, email) => {
  if (identity?.status === USER_STATUS.UNCONFIRMED) {
    throw httpError({
      error: API_ERRORS.USER_UNCONFIRMED,
      details: [
        `Please verify your account: ${email}`,
        "If code is lost or expired then please initiate resend confirmation code.",
      ],
    });
  }
  if (identity?.status === USER_STATUS.BLOCKED) {
    throw httpError({
      error: API_ERRORS.USER_BLOCKED,
      details: [`User is blocked: ${email}`],
    });
  }
};

export const assertSessionMatchesIdentity = (authContext, identity) => {
  const sessionSub = authContext?.cognitoSub ?? authContext?.sub;
  if (sessionSub !== identity.cognitoSub) {
    throw httpError({
      error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
      details: [
        "Session does not match this account. Sign in with the correct identity or contact support.",
      ],
    });
  }
};

export const assertPasswordSet = (identity, { flow = "change" } = {}) => {
  if (identity?.passwordSet) {
    return;
  }

  const providerNames =
    identity?.linkedProviders?.join(", ") || "social account";
  const isReset = flow === "reset";

  throw httpError({
    error: API_ERRORS.OAUTH_ONLY_USER,
    message: isReset
      ? "Password Reset Not Available"
      : "Password Not Configured",
    details: isReset
      ? [
          `You signed up using ${providerNames}.`,
          `Please sign in with ${providerNames} instead of using password reset.`,
        ]
      : [
          "No password is configured for this account.",
          "Set a password first or continue using your linked social sign-in.",
        ],
  });
};

/** Resolves pool username for native password APIs; throws on ambiguous / missing. */
export const requireNativeCognitoUsername = async (
  config,
  identity,
  email,
  { missingDetail } = {},
) => {
  const resolved = await resolveCognitoUsernameByEmailAndSub(
    config,
    identity.email,
    identity.cognitoSub,
  );

  if (resolved.ok) return resolved.username;

  if (resolved.reason === "ambiguous") {
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
      missingDetail ??
        `No Cognito password user matches your account (${email}). Sign in with your linked provider or contact support.`,
    ],
  });
};
