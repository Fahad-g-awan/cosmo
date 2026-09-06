import { createRefreshRouteHandlers } from "@cosmediate/auth-bff";
import { generateAllowedOrigins } from "@cosmediate/config";

export const { OPTIONS, POST } = createRefreshRouteHandlers({
  allowedOrigins: generateAllowedOrigins(),
  routeLogPrefix: "[blog:/api/auth/refresh]",
});
