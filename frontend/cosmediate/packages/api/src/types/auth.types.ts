import {
  AuthMeMethodsResponse,
  AuthMeResponse,
  AuthTokens,
  UserRole,
} from "@cosmediate/type-utils";

export type { AuthTokens };

export interface SignInRequest {
  email?: string;
  password?: string;
  code?: string;
  redirectUri?: string;
  method?: string;
}

export interface BackendOriginOptions {
  /** Forwarded to backend `Origin` header — required by API gateway allowlist. */
  origin?: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
  password?: string;
}

export interface UpdatePasswordRequest {
  email: string;
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface setNewPasswordRequest {
  email: string;
  userId: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResendSignupCodeRequest {
  email: string;
}

export interface ResendForgotPasswordCodeRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface LogoutRequest {
  redirectUri: string;
}

export interface OAuthLinkStartRequest {
  redirectUri: string;
  identityProvider?: string;
}

export interface OAuthLinkStartResponse {
  success: boolean;
  authorizeUrl?: string;
  message?: string;
  error?: string;
  details?: string[] | null;
}

export interface OAuthLinkCallbackRequest {
  email: string;
  userId: string;
  code: string;
  redirectUri: string;
  refreshToken?: string;
  identityProvider?: string;
}

export interface OAuthLinkCallbackResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string[] | null;
  linkedProviders?: string[];
  tokensIssued?: boolean;
  sessionId?: string;
  accessToken?: string;
  accessTokenExpiresAt?: number;
  refreshTokenExpiresAt?: number;
  identityId?: string;
  profileId?: string | null;
  role?: UserRole;
}

// Auth API Response Types
//
// `AuthTokens` is the canonical shape from `@cosmediate/type-utils` — see
// AUTH_SYSTEM_MASTER_PLAN.md §7. Re-exported above so existing
// `@cosmediate/api` consumers don't break.

export interface SignInResponse extends AuthTokens {
  success: boolean;
  message: string;
  sessionId: string;
  identityId: string;
  profileId: string | null;
  role: UserRole;
}

export type GetCurrentUserResponse = AuthMeResponse;

export type GetAuthMeMethodsResponse = AuthMeMethodsResponse;

export interface SignUpResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  details?: string[] | null;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  status?: string;
  requiresSignIn?: boolean;
  error?: string;
  details?: string[] | null;
  /** Present when confirm auto-signs the user in. */
  sessionId?: string;
  accessToken?: string;
  accessTokenExpiresAt?: number;
  refreshTokenExpiresAt?: number;
  identityId?: string;
  profileId?: string | null;
  role?: UserRole;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string[] | null;
}

export interface setNewPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string[] | null;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string[] | null;
}

export interface ResendSignupCodeResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string[] | null;
}

export interface ResendForgotPasswordCodeResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string[] | null;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string[] | null;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  logoutUrl?: string;
  error?: string;
  details?: string[] | null;
}

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: string[] | null;
}

// Backend error envelope (axios `response.data` on 4xx/5xx)
export interface ApiError {
  success?: false;
  message: string;
  statusCode?: number;
  error?: string;
  details?: string[] | null;
}
