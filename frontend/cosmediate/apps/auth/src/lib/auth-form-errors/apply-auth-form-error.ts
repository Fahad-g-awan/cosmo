import type { Dispatch, SetStateAction } from "react";

import { Toaster } from "@cosmediate/ui";
import type { AuthMessages } from "@cosmediate/i18n";

import type {
  AuthFormErrorInput,
  AuthFormErrorResult,
  AuthFormFlow,
} from "./types";
import { resolveAuthFormError } from "./resolve-auth-form-error";

function detailsDescription(details: unknown): string | undefined {
  if (!Array.isArray(details) || details.length === 0) return undefined;
  const parts = details
    .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
    .map((d) => d.trim());
  return parts.length > 0 ? parts.join(" ") : undefined;
}

export function applyAuthFormError<T extends object>(
  flow: AuthFormFlow,
  input: AuthFormErrorInput,
  setFormErrors: Dispatch<SetStateAction<T>>,
  auth: AuthMessages,
): AuthFormErrorResult {
  const resolved = resolveAuthFormError(flow, input, auth);

  if (resolved.fieldErrors) {
    setFormErrors((prev) => ({ ...prev, ...resolved.fieldErrors }) as T);
  }

  if (resolved.toast) {
    let description = resolved.toast.description;

    if (resolved.preferDetailsInToast) {
      const fromApi = detailsDescription(input.details);
      if (fromApi) {
        description = fromApi;
        // Keep the support hint when API details omit it (e.g. user_blocked).
        const support = resolved.toast.description;
        if (
          support &&
          /contact support/i.test(support) &&
          !/contact support/i.test(fromApi)
        ) {
          description = `${fromApi} ${support}`;
        }
      }
    }

    Toaster(resolved.toast.title, "error", description);
  }

  if (resolved.redirect && typeof window !== "undefined") {
    window.location.href = resolved.redirect;
  }

  return resolved;
}

/**
 * Client-side validation failed: fields are already set by the form.
 * Toast only — never run the API error resolver / generic fallback.
 */
export function applyClientValidationError(auth: AuthMessages): void {
  Toaster(auth.toasts.fixValidationErrors, "error");
}
