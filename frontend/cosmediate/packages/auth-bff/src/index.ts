export { optionsHandler, requestHeader } from "./default-cors";
export { createCorsHelpers } from "./cors";
export type { CorsHelpers } from "./cors";

export { getPasswordFlowCredentials } from "./password-flow-session";

export { createExchangeCodeRouteHandlers } from "./routes/exchange-code";
export { createGetSessionRouteHandlers } from "./routes/get-session";
export { createRefreshRouteHandlers } from "./routes/refresh";
export { createLogoutRouteHandlers } from "./routes/logout";
export { createUpdatePasswordRouteHandlers } from "./routes/update-password";
export { createSetPasswordRouteHandlers } from "./routes/set-password";

export type {
  ExchangeCodeRouteHandlerConfig,
  GetSessionRouteHandlerConfig,
  LogoutRouteHandlerConfig,
  PasswordRouteHandlerConfig,
  RefreshRouteHandlerConfig,
} from "./types";
