import { getAuthClearSessionUrlClient } from "@cosmediate/config";

/**
 * Handles an unauthorized-access state detected on the client.
 *
 * Called when the client discovers its identity is broken (e.g. session
 * cookies present but user data cannot be fetched, role unknown, or any
 * other inconsistency). Performs best-effort cleanup then hard-redirects
 * the browser to the auth app's clear-session endpoint.
 *
 * Flow (per AUTH_SYSTEM_MASTER_PLAN Section 15, decision A2):
 *   1. Best-effort POST /api/auth/logout -- revokes backend tokens
 *      (GlobalSignOutCommand) + clears IdP cookies on auth domain +
 *      clears client cookies on this domain.
 *   2. Hard-redirect to auth app /oauth/clear-session -- acts as a final
 *      safety net that wipes any IdP cookies the backend call might
 *      have missed and lands the user on the auth app (which routes
 *      them to signin).
 *
 * Failures in step 1 MUST NOT block step 2. The redirect is unconditional.
 *
 * This function does not return; the browser navigates away.
 */
export async function handleUnauthorizedAccess(
  accessToken?: string
): Promise<void> {
  // Step 1: best-effort backend logout + cookie cleanup via client BFF.
  if (accessToken) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ access_token: accessToken }),
      });
    } catch {
      // Swallow -- we proceed to the hard redirect regardless.
    }
  }

  // Step 2: hard redirect to auth clear-session.
  if (typeof window !== "undefined") {
    window.location.href = getAuthClearSessionUrlClient();
  }
}
