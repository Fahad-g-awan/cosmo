import type { AuthMessages } from "@cosmediate/i18n";

const PRESIGNUP_PREFIX = /^presignup\s+failed\s+with\s+error\s+/i;
const PRETOKEN_PREFIX =
  /^pretokengeneration(?:v2_0)?\s+failed\s+with\s+error\s+/i;

/**
 * Map Cognito Hosted UI / token-exchange error text to a clear user-facing string.
 */
export function mapHostedUiOAuthErrorDescription(
  description: string | null | undefined,
  auth: AuthMessages,
): string {
  if (!description?.trim()) {
    return auth.processing.oauthErrorFallback;
  }

  const raw = description.trim();
  const lower = raw.toLowerCase();

  if (
    lower.includes("user is blocked") ||
    (/\bblocked\b/.test(lower) && !lower.includes("provider_linked"))
  ) {
    return [
      auth.errors.accountBlockedTitle,
      auth.errors.accountBlockedDescription,
    ].join(". ");
  }

  if (
    lower.includes("unavailable") ||
    lower.includes("no active identity") ||
    lower.includes("pretokengeneration")
  ) {
    return auth.processing.accountUnavailable;
  }

  if (lower.includes("email mismatch") || lower.includes("mismatch")) {
    return auth.processing.emailMismatch;
  }

  const cleaned = raw
    .replace(PRESIGNUP_PREFIX, "")
    .replace(PRETOKEN_PREFIX, "")
    .replace(/^failed to fetch token\s*/i, "")
    .trim();

  // Token endpoint often embeds Cognito JSON — try to pull a nested error string.
  if (cleaned.startsWith("{")) {
    try {
      const parsed = JSON.parse(cleaned) as { error?: string };
      if (typeof parsed.error === "string" && parsed.error.trim()) {
        return mapHostedUiOAuthErrorDescription(parsed.error, auth);
      }
    } catch {
      // fall through
    }
  }

  if (
    cleaned.toLowerCase().includes("unavailable") ||
    cleaned.toLowerCase().includes("no active identity") ||
    cleaned.toLowerCase().includes("pretokengeneration")
  ) {
    return auth.processing.accountUnavailable;
  }

  return cleaned || auth.processing.oauthErrorFallback;
}

/**
 * Map API / link-complete failure payloads to clear copy.
 */
export function mapAuthApiFailureMessage(
  input: {
    error?: string;
    message?: string;
    details?: unknown;
  },
  auth: AuthMessages,
  fallback: string,
): string {
  const code = String(input.error || "").toLowerCase();

  if (code === "email_mismatch") {
    return auth.processing.emailMismatch;
  }
  if (code === "user_blocked") {
    return [
      auth.errors.accountBlockedTitle,
      auth.errors.accountBlockedDescription,
    ].join(". ");
  }
  if (code === "account_unavailable") {
    return auth.processing.accountUnavailable;
  }

  const details = Array.isArray(input.details)
    ? input.details
        .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
        .join(" ")
    : "";

  const combined = [input.message, details].filter(Boolean).join(" ");
  if (combined) {
    return mapHostedUiOAuthErrorDescription(combined, auth);
  }

  return fallback;
}
