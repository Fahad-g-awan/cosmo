import type {
  AuthErrorCode,
  AuthErrorResponse,
} from "@cosmediate/type-utils";

/**
 * Generic discriminated union for auth route responses, parameterized by the
 * success-branch payload `TSuccess` (which MUST include `success: true`).
 *
 * Why not reuse `AuthResult<T>` from `@cosmediate/type-utils` directly here?
 * The IdP and BFF auth routes currently spread their success payloads onto
 * the top level of the response body (e.g. signin returns
 * `{ success: true, redirectTo, accessToken, ... }`) rather than nesting under
 * `{ success: true, data: { ... } }`. Restructuring those legacy success
 * payloads is deliberately out of scope for Phase 3 (it lands with the cookie
 * & session redesign in P6 + the auth-bff package in P8). This local alias
 * lets each hook describe its real success shape without requiring server
 * restructuring first. The error branch is the standard `AuthErrorResponse`.
 */
export type AuthHookResult<TSuccess extends { success: true }> =
  | TSuccess
  | AuthErrorResponse;

/**
 * Parse a `fetch` Response from any auth route into the discriminated
 * `AuthHookResult<TSuccess>` union.
 *
 * If the body is missing or unparseable, this synthesizes a `server_error`
 * `AuthErrorResponse` so callers never have to handle `null`.
 */
export async function parseAuthResponse<
  TSuccess extends { success: true } = { success: true } & Record<
    string,
    unknown
  >,
>(response: Response): Promise<AuthHookResult<TSuccess>> {
  const body: unknown = await response.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return {
      success: false,
      error: "server_error" as AuthErrorCode,
      message: `Auth route returned no body (status ${response.status})`,
    };
  }

  const obj = body as { success?: boolean };

  if (obj.success === true) {
    return body as TSuccess;
  }

  const err = body as Partial<AuthErrorResponse>;
  return {
    success: false,
    error: (err.error ?? "server_error") as AuthErrorCode,
    message: err.message ?? "Something went wrong, please try again.",
    ...(err.details !== undefined ? { details: err.details } : {}),
  };
}

/**
 * Synthesize an `AuthErrorResponse` for client-side preconditions that fail
 * before any HTTP call (e.g. invalid email format). Use this in hooks so the
 * caller always sees a discriminated `AuthHookResult` instead of mixing throw
 * channels with return channels.
 */
export function authClientError(
  code: AuthErrorCode,
  message: string
): AuthErrorResponse {
  return { success: false, error: code, message };
}
