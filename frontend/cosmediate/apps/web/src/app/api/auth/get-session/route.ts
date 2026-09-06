import { createGetSessionRouteHandlers } from "@cosmediate/auth-bff";
import { generateAllowedOrigins } from "@cosmediate/config";

export const { OPTIONS, GET } = createGetSessionRouteHandlers({
  allowedOrigins: generateAllowedOrigins(),
  routeLogPrefix: "[web:/api/auth/get-session]",
});
