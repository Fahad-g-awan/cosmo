import { createGetSessionRouteHandlers } from "@cosmediate/auth-bff";
import { generateAllowedOrigins } from "@cosmediate/config";

export const { OPTIONS, GET } = createGetSessionRouteHandlers({
  allowedOrigins: generateAllowedOrigins(),
  routeLogPrefix: "[blog:/api/auth/get-session]",
});
