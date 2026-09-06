import { EntityMetadata, Location } from "./shared";

export type UserRole = "ADMIN" | "MANAGER" | "SPECIALIST" | "PATIENT";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type UserStatus = "ACTIVE" | "BLOCKED" | "UNCONFIRMED" | "PENDING";

/**
 * Canonical auth-tokens shape. Used at every layer (backend wire format,
 * IdP runtime, DDB session record) — no per-layer drift permitted.
 *
 * `accessTokenExpiresAt` and `refreshTokenExpiresAt` are unix-seconds (UTC), aligned
 * with Cognito `ExpiresIn` and middleware comparisons against
 * `Math.floor(Date.now() / 1000)`.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

/**
 * Slim subset of `AuthTokens` that's safe to expose to client apps via
 * cookies and the IdP `sessionData` blob. Refresh and id tokens are
 * intentionally excluded — refresh tokens MUST stay backend-only, and
 * id tokens are not used by any client code today.
 *
 * This is the shape used for access/expiry fields in:
 * - Client **`cos_*`** scalar cookies (`cos_access_token`, `cos_token_exp`, `cos_refresh_exp`)
 * - IdP **`cos_idp_*`** scalar cookies
 * - `OAuthContext.sessionData` in DynamoDB (flat snake_case)
 * - `Session.tokens` returned by `/api/auth/get-session` (all apps; IdP reads `cos_idp_*`, clients read `cos_*`)
 */
export type SessionTokens = Pick<
  AuthTokens,
  "accessToken" | "accessTokenExpiresAt" | "refreshTokenExpiresAt"
>;

export interface Session {
  sessionId?: string;
  identityId?: string;
  profileId?: string | null;
  user?: SessionUser;
  userRole?: UserRole;
  tokens?: SessionTokens;
}

import type { WorkingType } from "./specialist";

/** Optional role-scoped ids on session user (manager / specialist clinic links). */
export interface SessionUserRoleScope {
  parentClinicId?: string | null;
  clinicIds?: string[];
  workingType?: WorkingType;
}

/**
 * Slim logged-in user for auth context — identity + display profile only.
 * Use `profileId` / `identityId` explicitly (no bare `id`).
 */
export interface SessionUser {
  identityId: string;
  profileId: string;
  role: UserRole;
  status: UserStatus;
  perms: string[];
  passwordSet: boolean;
  defaultPasswordUsed: boolean;
  linkedProviders: string[];
  cognitoSub?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  image?: string | null;
  age?: string;
  gender?: Gender;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  completeAddress?: string;
  scope?: SessionUserRoleScope;
}

/** Wire shape of backend `toMeProfileItem` — mapper input only. */
export interface MeProfileWire {
  id: string;
  identityId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string | null;
  image?: string | null;
  age?: string;
  gender?: Gender;
  role?: UserRole | null;
  status?: UserStatus;
  perms?: string[];
  cognitoSub?: string;
  defaultPasswordUsed?: boolean;
  passwordSet?: boolean;
  linkedProviders?: string[];
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  completeAddress?: string;
  parentClinicId?: string | null;
  clinicIds?: string[];
  workingType?: WorkingType;
}

/** Identity account from `GET /auth/me` (auth layer, not full profile). */
export interface IdentityDto {
  id: string;
  email: string;
  phone?: string | null;
  role: UserRole | null;
  status: UserStatus;
  perms?: string[];
  cognitoSub?: string;
  defaultPasswordUsed?: boolean;
  passwordSet?: boolean;
  linkedProviders?: string[];
}

export interface ClinicManager extends EntityMetadata, Location {
  image: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: string;
  gender?: string;
  parentClinicId: string;
  clinicIds: string[];
  clinics?: Array<{
    id: string;
    name?: string;
    completeAddress?: string;
    city?: string;
    clinicType?: "PARENT" | "NODE";
    parentClinicId?: string | null;
  }>;
  role: "MANAGER";
  perms: string[];
  sub: string;
  status: UserStatus;
  passwordSet: boolean;
  defaultPasswordUsed: boolean;
  linkedProviders: string[];

  clinicCount?: number;
}

export interface Admin extends EntityMetadata, Location {
  email: string;
  image: string;
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: "ADMIN";
  age: string;
  gender?: string;
  perms: string[];
  sub: string;
  status: UserStatus;
  passwordSet: boolean;
  defaultPasswordUsed: boolean;
  linkedProviders: string[];
}

export type PatientCreationSource =
  | "ADMIN"
  | "MANAGER"
  | "SPECIALIST"
  | "SELF_SIGNUP";

export interface Patient extends EntityMetadata, Location {
  email: string;
  image: string;
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: string;
  role: "PATIENT";
  gender?: string;
  sub: string;
  status: UserStatus;
  perms: string[];
  passwordSet: boolean;
  defaultPasswordUsed: boolean;
  linkedProviders: string[];
  creationSource?: PatientCreationSource | null;
}

/** `GET /auth/me` success payload. */
export interface AuthMeResponse {
  success: boolean;
  identityId: string;
  profileId: string | null;
  role: UserRole | null;
  identity: IdentityDto;
  profile: MeProfileWire | null;
  profileReady: boolean;
}

/** `GET /auth/me/methods` success payload. */
export interface AuthMeMethodsResponse {
  success: boolean;
  identityId: string;
  email: string;
  passwordSet: boolean;
  linkedProviders: string[];
  canRemovePassword: boolean;
  canUnlink: boolean;
  hasMinimumOneSignInMethod: boolean;
  oauthLinkPermitted: boolean;
  boundedRetryFlows: string[];
}

/**
 * Standard auth error vocabulary.
 *
 * Source of truth: AUTH_SYSTEM_MASTER_PLAN.md §5.2 (Phase 3 — Error Handling
 * Standardization). Add new codes here only when a new failure mode genuinely
 * requires distinct client handling; otherwise reuse an existing code.
 *
 * Reserved-but-unused codes (`refresh_unavailable`, `refresh_revoked`) land in
 * (refresh tokens). `not_authenticated` is reserved for middleware /
 * route-guard usage in Phase 10.
 */
export type AuthErrorCode =
  // Validation (400)
  | "invalid_request"
  // OAuth2 (400) — RFC 6749
  | "invalid_grant"
  | "invalid_client"
  | "unsupported_grant_type"
  // Auth state (401)
  | "not_authenticated"
  | "invalid_session"
  // Flow-specific (400/500)
  | "missing_auth_code"
  | "token_exchange_failed"
  | "refresh_unavailable"
  | "refresh_revoked"
  // Server (500)
  | "server_misconfig"
  | "server_error";

/**
 * Standard error response shape for every auth route:
 *  - `apps/auth/.../api/auth/token/route.ts`   — keeps OAuth2 RFC 6749 shape
 *  - `apps/auth/.../api/auth/get-session/route.ts` — IdP query shape (`cos_idp_*`)
 *  - client `apps/{app,web,blog}/.../api/auth/get-session/route.ts` — same query shape (`cos_*`)
 */
export interface AuthErrorResponse {
  success: false;
  error: AuthErrorCode;
  message: string;
  details?: unknown;
}

export interface AuthSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
  redirectTo?: string;
}

export type AuthResult<T = unknown> =
  | AuthSuccessResponse<T>
  | AuthErrorResponse;
