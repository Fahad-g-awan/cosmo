import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";

import { resolveCognitoUsernameByEmailAndSub } from "/opt/nodejs/services/auth/cognito-linking.mjs";
import {
  cognitoGetUserByEmailIfExists,
  listCognitoUsersByEmail,
} from "/opt/nodejs/lib/auth/cognito/admin-users.mjs";
import { parseCognitoExternalUsername } from "/opt/nodejs/lib/auth/cognito/provider.utils.mjs";
import { cognitoIDP } from "/opt/nodejs/lib/auth/cognito-idp.client.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

export const cognitoErrName = (error) => error?.name || error?.code || "";

/** Trim whitespace only — never pad or mutate digits (Cognito codes must match exactly). */
export const normalizeVerificationCode = (code) =>
  String(code ?? "")
    .trim()
    .replace(/\s+/g, "");

/** Read code before AJV `coerceTypes` can turn numeric JSON into strings without leading zeros. */
export const signupVerificationCodeFromBody = (reqBody) =>
  normalizeVerificationCode(reqBody?.code);

/**
 * Canonical pool `Username` for an unconfirmed native signup user.
 * Prefer AdminGetUser(email) — same identifier Cognito uses for alias-based resend.
 */
export const resolveUnconfirmedSignupCognitoUsername = async (
  config,
  foundUser,
) => {
  const email = foundUser.email;

  const admin = await cognitoGetUserByEmailIfExists(config, email);
  if (admin?.Username && admin.UserStatus === "UNCONFIRMED") {
    return admin.Username;
  }

  const poolUsers = await listCognitoUsersByEmail(config, email);
  const nativeUnconfirmed = poolUsers.filter((u) => {
    if (u.UserStatus !== "UNCONFIRMED") return false;
    const parsed = parseCognitoExternalUsername(u.Username || "");
    return !parsed.cognitoProviderName;
  });

  if (foundUser.cognitoSub) {
    const subMatch = nativeUnconfirmed.filter((u) => {
      const sub = u.Attributes?.find((a) => a.Name === "sub")?.Value;
      return sub === foundUser.cognitoSub;
    });
    if (subMatch.length === 1) return subMatch[0].Username;
  }

  if (nativeUnconfirmed.length === 1) return nativeUnconfirmed[0].Username;

  if (foundUser.cognitoSub) {
    const resolved = await resolveCognitoUsernameByEmailAndSub(
      config,
      email,
      foundUser.cognitoSub,
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
  }

  return email;
};

/** Signup registers with lowercased email; pool Username may differ — try both on confirm. */
export const signupConfirmUsernameCandidates = (canonicalUsername, email) => {
  const candidates = [];
  const add = (value) => {
    const next = String(value ?? "").trim();
    if (next && !candidates.includes(next)) candidates.push(next);
  };
  add(canonicalUsername);
  add(email);
  return candidates;
};

/** Cognito must be CONFIRMED before password-reset codes are issued. */
export const assertCognitoUserConfirmedForPasswordReset = async (
  config,
  cognitoUsername,
  email,
) => {
  let user;
  try {
    user = await cognitoIDP.send(
      new AdminGetUserCommand({
        UserPoolId: config.COGNITO_USER_POOL_ID,
        Username: cognitoUsername,
      }),
    );
  } catch (error) {
    if (cognitoErrName(error) === "UserNotFoundException") {
      throw httpError({
        error: API_ERRORS.USER_NOT_FOUND,
        details: [`User does not exists: ${email}`, "Please signup first"],
      });
    }
    throw error;
  }

  const status = user?.UserStatus ?? "";
  if (status === "UNCONFIRMED") {
    throw httpError({
      error: API_ERRORS.USER_UNCONFIRMED,
      details: [
        `Please verify your account before resetting password: ${email}`,
        "Complete email verification first, then try again.",
      ],
    });
  }

  return user;
};

export const throwCognitoConfirmationCodeError = (
  cognitoError,
  email,
  { flow = "confirm" } = {},
) => {
  const errName = cognitoErrName(cognitoError);
  const flowLabel =
    flow === "reset" ? "reset your password" : "confirm your account";

  if (errName === "CodeMismatchException") {
    throw httpError({
      error: API_ERRORS.INVALID_VERIFICATION_CODE,
      details: [
        "Invalid verification code. Please check the code and try again.",
        flow === "reset"
          ? "Use the latest code from your password reset email (not sign-up verification). Request a new code if this one fails."
          : "Use the latest code from your most recent verification email. Older codes stop working after you resend.",
      ].filter(Boolean),
    });
  }

  if (errName === "ExpiredCodeException") {
    throw httpError({
      error: API_ERRORS.VERIFICATION_CODE_EXPIRED,
      details: [
        `Verification code has expired. Request a new code to ${flowLabel}.`,
      ],
    });
  }

  if (
    errName === "LimitExceededException" ||
    errName === "TooManyRequestsException"
  ) {
    throw httpError({
      error: API_ERRORS.TOO_MANY_REQUESTS,
      details: [
        "Too many attempts. Please wait a moment before trying again.",
      ],
    });
  }

  if (errName === "NotAuthorizedException") {
    throw httpError({
      error: API_ERRORS.USER_ALREADY_CONFIRMED,
      details: [`User has already confirmed: ${email}`, "Please signin"],
    });
  }

  if (errName === "UserNotFoundException") {
    throw httpError({
      error: API_ERRORS.USER_NOT_FOUND,
      details: [`User does not exists: ${email}`, "Please signup first"],
    });
  }

  if (errName === "InvalidPasswordException") {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        cognitoError?.message ||
          "Password does not meet the required policy.",
      ],
    });
  }

  if (errName === "InvalidParameterException") {
    throw httpError({
      error: API_ERRORS.INVALID_VERIFICATION_CODE,
      details: [
        cognitoError?.message ||
          "Invalid verification code provided, please try again.",
      ],
    });
  }

  throw httpError({
    error: API_ERRORS.BAD_REQUEST,
    details: [
      flow === "reset"
        ? "Unable to reset password"
        : "Unable to confirm signup",
      cognitoError?.message || "",
    ],
  });
};

export const throwCognitoForgotPasswordError = (cognitoError, email) => {
  const errName = cognitoErrName(cognitoError);

  if (
    errName === "LimitExceededException" ||
    errName === "TooManyRequestsException"
  ) {
    throw httpError({
      error: API_ERRORS.TOO_MANY_REQUESTS,
      message: "Too Many Requests",
      details: [
        "Too many attempts. Please wait a moment before requesting another code.",
      ],
    });
  }

  if (errName === "UserNotFoundException") {
    throw httpError({
      error: API_ERRORS.USER_NOT_FOUND,
      details: [`User does not exists: ${email}`, "Please signup first"],
    });
  }

  if (errName === "InvalidParameterException") {
    throw httpError({
      error: API_ERRORS.USER_UNCONFIRMED,
      details: [
        `Please verify your account before resetting password: ${email}`,
      ],
    });
  }

  throw httpError({
    error: API_ERRORS.BAD_REQUEST,
    details: [
      "Unable to send password reset code",
      cognitoError?.message || "",
    ],
  });
};
