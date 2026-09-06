import type { AuthErrorCode } from "@cosmediate/type-utils";

export type AuthFormFlow =
  | "signin"
  | "signup"
  | "confirm-signup"
  | "forgot-password"
  | "reset-password";

/**
 * Backend domain codes that form routes pass through (not Phase-3 AuthErrorCode).
 * Kept as string union so matchers stay typed without forcing OAuth routes to know them.
 */
export type AuthFormBackendErrorCode =
  | AuthErrorCode
  | "validation_error"
  | "user_blocked"
  | "user_not_found"
  | "user_unconfirmed"
  | "user_already_confirmed"
  | "user_exists"
  | "invalid_verification_code"
  | "verification_code_expired"
  | "oauth_only_user"
  | "email_mismatch"
  | "incorrect_password"
  | "account_unavailable"
  | "bad_request"
  | "internal_error"
  | "unauthorized"
  | (string & {});

export interface AuthFormErrorInput {
  error?: AuthFormBackendErrorCode;
  message: string;
  details?: unknown;
}

export interface AuthFormErrorToast {
  title: string;
  description?: string;
}

export interface AuthFormErrorResult {
  fieldErrors?: Record<string, string>;
  toast?: AuthFormErrorToast;
  redirect?: string;
  /** Prefer joining `details[]` into the toast description when present. */
  preferDetailsInToast?: boolean;
}

export type AuthFormErrorContext = AuthFormErrorInput & {
  normalizedMessage: string;
};

export type AuthFormErrorRule = {
  when: (ctx: AuthFormErrorContext) => boolean;
  result: AuthFormErrorResult;
};
