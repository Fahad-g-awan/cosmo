import { createExchangeCodeRouteHandlers } from "@cosmediate/auth-bff";
import { generateAllowedOrigins } from "@cosmediate/config";

export const { OPTIONS, POST } = createExchangeCodeRouteHandlers({
  allowedOrigins: generateAllowedOrigins(),
  routeLogPrefix: "[web:/api/auth/exchange-code]",
});
