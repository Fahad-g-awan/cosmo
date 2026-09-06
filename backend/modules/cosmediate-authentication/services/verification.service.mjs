import {
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import {
  USER_STATUS,
  AUTH_STATUS,
} from "/opt/nodejs/constants/auth/status.constants.mjs";
import { calculateSecretHash } from "/opt/nodejs/lib/auth/crypto/cognito-secret-hash.utils.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { cognitoIDP } from "/opt/nodejs/lib/auth/cognito-idp.client.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  signupVerificationCodeFromBody,
  resolveUnconfirmedSignupCognitoUsername,
  signupConfirmUsernameCandidates,
  throwCognitoConfirmationCodeError,
  cognitoErrName,
} from "../lib/cognito-verification.mjs";
import { nativeSignIn } from "./signin-native.service.mjs";
import { updateIdentityStatus } from "../lib/identity-updates.mjs";
import { findIdentityByEmail } from "../lib/identity.mjs";

const confirmedWithoutSession = () => ({
  statusCode: 200,
  data: {
    message: "Email verified. Please sign in to continue.",
    status: AUTH_STATUS.REQUIRES_SIGNIN,
    success: true,
    requiresSignIn: true,
  },
});

const confirmSignupWithUsernameCandidates = async ({
  config,
  candidates,
  confirmationCode,
}) => {
  let lastError;

  for (let i = 0; i < candidates.length; i += 1) {
    const cognitoUsername = candidates[i];

    try {
      await cognitoIDP.send(
        new ConfirmSignUpCommand({
          ClientId: config.COGNITO_CLIENT_ID,
          Username: cognitoUsername,
          ConfirmationCode: confirmationCode,
          SecretHash: calculateSecretHash(
            cognitoUsername,
            config.COGNITO_CLIENT_ID,
            config.COGNITO_CLIENT_SECRET,
          ),
        }),
      );
      return cognitoUsername;
    } catch (error) {
      lastError = error;
      const isLast = i === candidates.length - 1;
      const retryable = cognitoErrName(error) === "CodeMismatchException";

      if (!retryable || isLast) {
        throw error;
      }

      console.warn("[auth] confirm signup retry with alternate username", {
        tried: cognitoUsername,
        next: candidates[i + 1],
      });
    }
  }

  throw lastError;
};

export const signupConfirmation = async (ctx) => {
  const { config } = ctx;
  const confirmationCode = signupVerificationCodeFromBody(ctx.reqBody);

  const { value: reqBody } = await validateRequestBody(
    CRUD_ACTIONS.AUTH.EMAIL_VERIFICATION,
    ctx.reqBody,
  );

  const { email, password } = reqBody;

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

  if (foundUser.status === USER_STATUS.ACTIVE) {
    throw httpError({
      error: API_ERRORS.USER_ALREADY_CONFIRMED,
      details: [`User has already confirmed: ${email}`, "Please signin"],
    });
  }

  if (foundUser.status === USER_STATUS.BLOCKED) {
    throw httpError({
      error: API_ERRORS.USER_BLOCKED,
      details: [`User is blocked: ${email}`, "Please contact admin."],
    });
  }

  const canonicalUsername = await resolveUnconfirmedSignupCognitoUsername(
    config,
    foundUser,
  );
  const usernameCandidates = signupConfirmUsernameCandidates(
    canonicalUsername,
    foundUser.email,
  );

  console.info("[auth] confirm signup", {
    email: foundUser.email,
    canonicalUsername,
    usernameCandidates,
    identityId: foundUser.id,
    codeLength: confirmationCode.length,
  });

  try {
    await confirmSignupWithUsernameCandidates({
      config,
      candidates: usernameCandidates,
      confirmationCode,
    });
  } catch (cognitoError) {
    console.error("[auth] confirm signup", cognitoError);
    throwCognitoConfirmationCodeError(cognitoError, foundUser.email, {
      flow: "confirm",
    });
  }

  await updateIdentityStatus({
    userId: foundUser.id,
    status: USER_STATUS.ACTIVE,
  });

  if (!password) {
    return confirmedWithoutSession();
  }

  try {
    const signInResult = await nativeSignIn(ctx, { email, password });
    if (signInResult?.data) {
      signInResult.data.message = "User confirmed and signed in";
      signInResult.data.status = AUTH_STATUS.CONFIRMED;
    }
    return signInResult;
  } catch (signInError) {
    console.error(
      "[auth] confirm signup: auto sign-in failed after confirm",
      signInError,
    );
    return confirmedWithoutSession();
  }
};

export const resendSignupCode = async (ctx) => {
  const { config } = ctx;
  const { value: reqBody } = await validateRequestBody(
    CRUD_ACTIONS.AUTH.RESEND_SIGNUP_CODE,
    ctx.reqBody,
  );

  const { email } = reqBody;

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

  if (foundUser.status === USER_STATUS.ACTIVE) {
    throw httpError({
      error: API_ERRORS.USER_ALREADY_CONFIRMED,
      details: [`User is already confirmed: ${email}`, "Please signin"],
    });
  }

  if (foundUser.status === USER_STATUS.BLOCKED) {
    throw httpError({
      error: API_ERRORS.USER_BLOCKED,
      details: [`User is blocked: ${email}`, "Please contact admin."],
    });
  }

  const cognitoUsername = await resolveUnconfirmedSignupCognitoUsername(
    config,
    foundUser,
  );

  try {
    const secretHash = calculateSecretHash(
      cognitoUsername,
      config.COGNITO_CLIENT_ID,
      config.COGNITO_CLIENT_SECRET,
    );

    const resendResp = await cognitoIDP.send(
      new ResendConfirmationCodeCommand({
        ClientId: config.COGNITO_CLIENT_ID,
        Username: cognitoUsername,
        SecretHash: secretHash,
      }),
    );

    console.info("[auth] resend signup code", {
      email: foundUser.email,
      cognitoUsername,
      identityId: foundUser.id,
      delivery: resendResp?.CodeDeliveryDetails ?? null,
    });
  } catch (cognitoError) {
    console.error("[auth] resend signup code", cognitoError);

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

    if (errName === "InvalidParameterException") {
      throw httpError({
        error: API_ERRORS.USER_ALREADY_CONFIRMED,
        details: [`User is already confirmed: ${email}`, "Please signin"],
      });
    }

    if (errName === "UserNotFoundException") {
      throw httpError({
        error: API_ERRORS.USER_NOT_FOUND,
        details: [`User does not exists: ${email}`, "Please signup first"],
      });
    }

    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "Unable to resend verification code",
        cognitoError?.message || "",
      ],
    });
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      message: `Verification code resent at ${foundUser.email}`,
      status: AUTH_STATUS.RESEND_CONF_CODE,
      requiresVerification: true,
      email: foundUser.email,
    },
  };
};
