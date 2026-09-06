import { createSetPasswordRouteHandlers } from "@cosmediate/auth-bff";
import { generateAllowedOrigins } from "@cosmediate/config";

export const { OPTIONS, POST } = createSetPasswordRouteHandlers({
  allowedOrigins: generateAllowedOrigins(),
  routeLogPrefix: "[app:/api/auth/set-password]",
});
