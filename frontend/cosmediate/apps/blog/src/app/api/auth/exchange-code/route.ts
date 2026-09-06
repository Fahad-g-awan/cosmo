import { createExchangeCodeRouteHandlers } from "@cosmediate/auth-bff";
import { generateAllowedOrigins } from "@cosmediate/config";

export const { OPTIONS, POST } = createExchangeCodeRouteHandlers({
  allowedOrigins: generateAllowedOrigins(),
  routeLogPrefix: "[blog:/api/auth/exchange-code]",
});
