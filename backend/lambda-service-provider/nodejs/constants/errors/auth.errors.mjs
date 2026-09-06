/** Auth / identity / session / OAuth domain errors. */
export const AUTH_ERRORS = {
  UNAUTHORIZED: {
    code: "unauthorized",
    status: 401,
    message: "Unauthorized",
  },
  USER_EXISTS: {
    code: "user_exists",
    status: 409,
    message: "User already exists",
  },
  USER_NOT_FOUND: {
    code: "user_not_found",
    status: 404,
    message: "User not found",
  },
  USER_UNCONFIRMED: {
    code: "user_unconfirmed",
    status: 403,
    message: "User is not confirmed",
  },
  USER_ALREADY_CONFIRMED: {
    code: "user_already_confirmed",
    status: 400,
    message: "User is already confirmed",
  },
  USER_BLOCKED: {
    code: "user_blocked",
    status: 403,
    message: "User is blocked",
  },
  AUTH_TOKEN: {
    code: "auth_token_error",
    status: 401,
    message: "Authentication token error",
  },
  INVALID_SESSION: {
    code: "invalid_session",
    status: 401,
    message: "Invalid session",
  },
  EMAIL_MISMATCH: {
    code: "email_mismatch",
    status: 400,
    message: "Email mismatch",
  },
  OAUTH_ALREADY_LINKED: {
    code: "oauth_already_linked",
    status: 409,
    message: "OAuth provider already linked",
  },
  PROVIDER_ALREADY_LINKED: {
    code: "provider_already_linked",
    status: 409,
    message: "Provider already linked",
  },
  OAUTH_ONLY_USER: {
    code: "oauth_only_user",
    status: 400,
    message: "OAuth-only user",
  },
  TOO_MANY_REQUESTS: {
    code: "too_many_requests",
    status: 429,
    message: "Too many requests",
  },
  INVALID_VERIFICATION_CODE: {
    code: "invalid_verification_code",
    status: 400,
    message: "Invalid verification code",
  },
  VERIFICATION_CODE_EXPIRED: {
    code: "verification_code_expired",
    status: 400,
    message: "Verification code expired",
  },
  COGNITO_IDENTITY_MISMATCH: {
    code: "cognito_identity_mismatch",
    status: 403,
    message: "Cognito identity mismatch",
  },
  OAUTH_PROVIDER_UNRESOLVED: {
    code: "oauth_provider_unresolved",
    status: 400,
    message: "OAuth provider unresolved",
  },
  PROVIDER_LINKED_RETRY: {
    code: "provider_linked_retry",
    status: 409,
    message: "Provider linked; retry sign-in",
  },
  PASSWORD_ALREADY_SET: {
    code: "password_already_set",
    status: 400,
    message: "Password already set",
  },
  INCORRECT_PASSWORD: {
    code: "incorrect_password",
    status: 400,
    message: "Incorrect password",
  },
  ACCOUNT_UNAVAILABLE: {
    code: "account_unavailable",
    status: 403,
    message: "Account unavailable",
  },
};
