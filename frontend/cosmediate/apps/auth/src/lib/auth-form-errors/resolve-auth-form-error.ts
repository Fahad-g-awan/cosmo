import type { AuthMessages } from "@cosmediate/i18n";

import { getAuthFormErrorFallback, getAuthFormErrorRules } from "./flows";
import { parseBackendFieldDetails } from "./parse-backend-field-details";
import { hasBackendError } from "./matchers";
import type {
  AuthFormErrorInput,
  AuthFormErrorResult,
  AuthFormFlow,
} from "./types";

function normalizeAuthFormMessage(input: AuthFormErrorInput): string {
  const parts = [input.message];

  if (Array.isArray(input.details)) {
    for (const detail of input.details) {
      if (typeof detail === "string" && detail.trim()) {
        parts.push(detail);
      }
    }
  }

  return parts.join(" ").trim().toLowerCase();
}

function pathDetailsResult(
  flow: AuthFormFlow,
  input: AuthFormErrorInput,
  auth: AuthMessages,
): AuthFormErrorResult | null {
  const fieldErrors = parseBackendFieldDetails(input.details, flow);
  if (Object.keys(fieldErrors).length === 0) return null;

  return {
    fieldErrors,
    toast: {
      title: auth.errors.validationFailed,
      description: auth.toasts.fixHighlightedFields,
    },
    preferDetailsInToast: true,
  };
}

/**
 * Resolve an auth API failure into field errors / toast / redirect.
 *
 * Order: backend error code → AJV path details → narrow phrase rules → fallback.
 */
export function resolveAuthFormError(
  flow: AuthFormFlow,
  input: AuthFormErrorInput,
  auth: AuthMessages,
): AuthFormErrorResult {
  const normalizedMessage = normalizeAuthFormMessage(input);
  const context = { ...input, normalizedMessage };

  for (const rule of getAuthFormErrorRules(flow, auth)) {
    if (rule.when(context)) {
      return rule.result;
    }
  }

  // Path-style validation details (after domain codes so blocked/unverified win).
  if (
    hasBackendError("validation_error", "invalid_request")(context) ||
    Array.isArray(input.details)
  ) {
    const fromPaths = pathDetailsResult(flow, input, auth);
    if (fromPaths) return fromPaths;
  }

  return getAuthFormErrorFallback(flow, auth);
}
