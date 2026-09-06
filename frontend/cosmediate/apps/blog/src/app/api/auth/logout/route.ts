import { createLogoutRouteHandlers } from "@cosmediate/auth-bff";
import { generateAllowedOrigins } from "@cosmediate/config";

export const { OPTIONS, POST } = createLogoutRouteHandlers({
  allowedOrigins: generateAllowedOrigins(),
  routeLogPrefix: "[blog:/api/auth/logout]",
});
