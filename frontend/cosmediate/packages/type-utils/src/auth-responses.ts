import { NextResponse } from "next/server";

import type {
  AuthErrorCode,
  AuthErrorResponse,
  AuthSuccessResponse,
} from "./auth";

/**
 * Helpers for building the standardized auth response shapes defined in
 * AUTH_SYSTEM_MASTER_PLAN.md §5.2 (Phase 3).
 *
 * Use these in every IdP route under `apps/auth/src/app/api/auth/**` and in
 * every client BFF route under `apps/{app,web,blog}/src/app/api/auth/**`,
 * EXCEPT the three documented exceptions (token / session / get-session).
 */

/**
 * Default HTTP status for each `AuthErrorCode`. Override via the `status`
 * argument to `authError` when a route needs a non-default status.
 */
const DEFAULT_STATUS: Record<AuthErrorCode, number> = {
  invalid_request: 400,
  invalid_grant: 400,
  invalid_client: 400,
  unsupported_grant_type: 400,
  not_authenticated: 401,
  invalid_session: 401,
  missing_auth_code: 400,
  token_exchange_failed: 502,
  refresh_unavailable: 401,
  refresh_revoked: 401,
  server_misconfig: 500,
  server_error: 500,
};

export interface AuthErrorOptions {
  /** Override the default HTTP status for this `code`. */
  status?: number;
  /** Optional structured details (e.g. upstream error payload). */
  details?: unknown;
  /** Extra response init (headers, etc.). */
  init?: Omit<ResponseInit, "status">;
}

/**
 * Build a `NextResponse` carrying the standard `AuthErrorResponse` body.
 *
 * @example
 *   return authError("invalid_request", "Email is required");
 *   return authError("server_error", err.message, { status: 500, details: err });
 */
export function authError(
  code: AuthErrorCode,
  message: string,
  options: AuthErrorOptions = {}
): NextResponse<AuthErrorResponse> {
  const body: AuthErrorResponse = {
    success: false,
    error: code,
    message,
    ...(options.details !== undefined ? { details: options.details } : {}),
  };
  return NextResponse.json(body, {
    ...options.init,
    status: options.status ?? DEFAULT_STATUS[code],
  });
}

export interface AuthSuccessOptions<T> {
  data?: T;
  message?: string;
  redirectTo?: string;
  status?: number;
  init?: Omit<ResponseInit, "status">;
}

/**
 * Build a `NextResponse` carrying the standard `AuthSuccessResponse` body.
 *
 * @example
 *   return authSuccess();
 *   return authSuccess({ data: { userId }, redirectTo: "/dashboard" });
 */
export function authSuccess<T = unknown>(
  options: AuthSuccessOptions<T> = {}
): NextResponse<AuthSuccessResponse<T>> {
  const body: AuthSuccessResponse<T> = {
    success: true,
    ...(options.data !== undefined ? { data: options.data } : {}),
    ...(options.message !== undefined ? { message: options.message } : {}),
    ...(options.redirectTo !== undefined
      ? { redirectTo: options.redirectTo }
      : {}),
  };
  return NextResponse.json(body, {
    ...options.init,
    status: options.status ?? 200,
  });
}
