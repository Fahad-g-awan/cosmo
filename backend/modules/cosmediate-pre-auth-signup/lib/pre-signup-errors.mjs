import { PROVIDER_LINKED_RETRY_CODE } from "/opt/nodejs/constants/errors/index.mjs";

/** Soft-deleted / permanently unavailable — Hosted UI surfaces this in error_description. */
export const ACCOUNT_UNAVAILABLE_MESSAGE =
  "This account is unavailable. Please contact support.";

/** Admin-blocked account — distinct copy so the SPA can map to user_blocked UX. */
export const ACCOUNT_BLOCKED_MESSAGE =
  "User is blocked. Please contact support.";

export const throwPreSignUpError = (message, { code, statusCode = 400 }) => {
  throw Object.assign(new Error(message), { code, statusCode });
};

export const throwAccountUnavailable = () =>
  throwPreSignUpError(ACCOUNT_UNAVAILABLE_MESSAGE, {
    code: "AccountUnavailableException",
    statusCode: 403,
  });

export const throwAccountBlocked = () =>
  throwPreSignUpError(ACCOUNT_BLOCKED_MESSAGE, {
    code: "AccountBlockedException",
    statusCode: 403,
  });

export const throwEmailAlreadyInUse = () =>
  throwPreSignUpError("Email already in use! Please sign in", {
    code: "UsernameExistsException",
    statusCode: 400,
  });

export const throwUnconfirmedNative = () =>
  throwPreSignUpError(
    "Please verify your email address first before signing in with a social account",
    { code: "UnconfirmedAccountException", statusCode: 400 },
  );

export const throwProviderLinkedRetry = (providerName, email) => {
  // Cognito Hosted UI only surfaces Error.message in error_description —
  // include the stable code in the message so the SPA can detect + silent-retry.
  const err = Object.assign(
    new Error(
      `${PROVIDER_LINKED_RETRY_CODE}: Linked ${providerName} to existing account (${email}); retry federated sign-in.`,
    ),
    {
      name: PROVIDER_LINKED_RETRY_CODE,
      code: PROVIDER_LINKED_RETRY_CODE,
    },
  );
  throw err;
};
