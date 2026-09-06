export const PROVIDER_LINKED_RETRY_CODE = "provider_linked_retry";

export const PRE_SIGNUP_AUTO_LINK_MAX_ATTEMPTS = 2;

/**
 * Cognito Hosted UI redirects PreSignUp failures as:
 *   error=invalid_request
 *   error_description=PreSignUp failed with error <Error.message>
 * It does NOT pass Error.code / Error.name. Match the stable code when present,
 * and the human message Cognito already surfaces from PreSignUp auto-link.
 */
export function isProviderLinkedRetryError(
  error?: string | null,
  errorDescription?: string | null,
): boolean {
  const haystack = `${error ?? ""} ${errorDescription ?? ""}`.toLowerCase();
  if (haystack.includes(PROVIDER_LINKED_RETRY_CODE)) return true;
  // Fallback for Lambdas that throw "Linked Google to existing account..." without the code prefix
  return /linked\s+\S+\s+to\s+existing\s+account/.test(haystack);
}

export function canRetryProviderLinkedLink(attempt: number): boolean {
  return attempt < PRE_SIGNUP_AUTO_LINK_MAX_ATTEMPTS;
}
