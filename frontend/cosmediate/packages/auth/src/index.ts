export * from "./hooks/useSignUp";
export * from "./hooks/useConfirmSignup";
export * from "./hooks/useSignIn";
export * from "./hooks/useUpdatePassword";
export * from "./hooks/useForgotPassword";
export * from "./hooks/useSetNewPassword";
export * from "./context/AuthProvider";
export * from "./hooks/useResetPassword";
export * from "./hooks/useResendCooldown";
export * from "./hooks/useResendSignupCode";
export * from "./hooks/useResendForgotPasswordCode";
export * from "./hooks/useSilentAuth";
export * from "./hooks/useAuth";
export {
  useSocialAccountsSignin,
  buildGoogleHostedUiAuthorizeUrl,
} from "./hooks/useSocialAccountsSignin";
export * from "./hooks/useSocialAccountLink";
export * from "./lib/bounded-retry";
export { default as SocialAccounts } from "./components/SocialAccounts";
export type { SocialAccountsProps } from "./components/SocialAccounts";

// Export utilities
export {
  toSessionUser,
  patchSessionUserFromProfileEntity,
} from "./lib/to-session-user";
export { ensureApiUnauthorizedInterceptor } from "./lib/api-unauthorized-interceptor";
export { handleUnauthorizedAccess } from "./lib/handle-unauthorized-access";
export {
  tryRefreshSession,
  shouldProactivelyRefresh,
  fetchAccessTokenFromSession,
  REFRESH_LEAD_SECONDS,
} from "./lib/try-refresh-session";
export type { TryRefreshSessionResult } from "./lib/try-refresh-session";

export type { SessionUserProfilePatch } from "./lib/to-session-user";
