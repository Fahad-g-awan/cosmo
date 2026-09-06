import { SHARED_ERRORS, STATUS_FALLBACK_ERROR } from "./shared.errors.mjs";
import { VALIDATION_ERRORS } from "./validation.errors.mjs";
import { AUTH_ERRORS } from "./auth.errors.mjs";

export { AUTH_ERRORS, SHARED_ERRORS, STATUS_FALLBACK_ERROR, VALIDATION_ERRORS };

/**
 * Single catalog for API error definitions used across the app.
 */
export const API_ERRORS = {
  ...SHARED_ERRORS,
  ...VALIDATION_ERRORS,
  ...AUTH_ERRORS,
};

/**
 * Stable string codes keyed by catalog name — for registry / FE i18n.
 */
export const ERROR_CODE = Object.fromEntries(
  Object.entries(API_ERRORS).map(([key, def]) => [key, def.code]),
);

/**
 * Lookup by snake_case code string.
 */
export const API_ERRORS_BY_CODE = Object.fromEntries(
  Object.values(API_ERRORS).map((def) => [def.code, def]),
);

/**
 * Hosted UI PreSignUp retry signal exposed on platform registry.
 */
export const PROVIDER_LINKED_RETRY_CODE = API_ERRORS.PROVIDER_LINKED_RETRY.code;

export const resolveApiError = (ref) => {
  if (!ref) return null;
  if (typeof ref === "object" && ref.code && ref.status && ref.message) {
    return ref;
  }
  if (typeof ref === "string") {
    return API_ERRORS[ref] ?? API_ERRORS_BY_CODE[ref] ?? null;
  }
  return null;
};
