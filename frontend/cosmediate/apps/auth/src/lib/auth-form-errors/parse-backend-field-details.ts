import type { AuthFormFlow } from "./types";

/**
 * Map AJV-style detail paths (`/password …`, `/newPassword …`) onto form field names.
 * Keys are raw paths without the leading slash.
 */
export const AUTH_FORM_FIELD_MAPS: Record<
  AuthFormFlow,
  Record<string, string>
> = {
  signin: {
    email: "email",
    password: "password",
  },
  signup: {
    email: "email",
    password: "password",
    firstName: "firstName",
    lastName: "lastName",
  },
  "confirm-signup": {
    code: "code",
    email: "code",
  },
  "forgot-password": {
    email: "email",
  },
  "reset-password": {
    code: "code",
    newPassword: "newPassword",
    password: "newPassword",
    email: "code",
  },
};

/**
 * Parse backend `details` lines shaped like `/field Message text` into form field errors.
 * Non-path lines are ignored (domain messages stay for code/phrase matchers).
 */
export function parseBackendFieldDetails(
  details: unknown,
  flow: AuthFormFlow,
): Record<string, string> {
  if (!Array.isArray(details) || details.length === 0) return {};

  const fieldMap = AUTH_FORM_FIELD_MAPS[flow];
  const errors: Record<string, string> = {};

  for (const detail of details) {
    if (typeof detail !== "string" || !detail.trim()) continue;

    const match = detail.trim().match(/^\/([\w./[\]-]+)\s+(.+)$/);
    if (!match?.[1] || !match[2]) continue;

    const rawPath = match[1].split("/")[0] ?? match[1];
    const field = fieldMap[rawPath] ?? rawPath;

    if (!errors[field]) {
      errors[field] = match[2].trim();
    }
  }

  return errors;
}
