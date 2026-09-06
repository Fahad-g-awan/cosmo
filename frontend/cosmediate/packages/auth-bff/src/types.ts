import type { OAuthTokenSuccessPayload } from "@cosmediate/config";

export interface ExchangeCodeRouteHandlerConfig {
  allowedOrigins: readonly string[];
  routeLogPrefix: string;
  /**
   * Dashboard: e.g. map `redirect_to === "/"` to role default route.
   * Default: use `parsed.redirect_to`.
   */
  exchangeRedirectTransform?: (parsed: OAuthTokenSuccessPayload) => string;
}

export interface GetSessionRouteHandlerConfig {
  allowedOrigins: readonly string[];
  routeLogPrefix: string;
}

export interface LogoutRouteHandlerConfig {
  allowedOrigins: readonly string[];
  routeLogPrefix: string;
}

export interface RefreshRouteHandlerConfig {
  allowedOrigins: readonly string[];
  routeLogPrefix: string;
}

export interface PasswordRouteHandlerConfig {
  allowedOrigins: readonly string[];
  routeLogPrefix: string;
}
