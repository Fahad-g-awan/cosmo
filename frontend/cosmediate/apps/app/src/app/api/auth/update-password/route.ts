import { createUpdatePasswordRouteHandlers } from "@cosmediate/auth-bff";
import { generateAllowedOrigins } from "@cosmediate/config";

export const { OPTIONS, POST } = createUpdatePasswordRouteHandlers({
  allowedOrigins: generateAllowedOrigins(),
  routeLogPrefix: "[app:/api/auth/update-password]",
});
