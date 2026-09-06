import { createExchangeCodeRouteHandlers } from "@cosmediate/auth-bff";
import {
  generateAllowedOrigins,
  type OAuthTokenSuccessPayload,
} from "@cosmediate/config";
import type { UserRole } from "@cosmediate/type-utils";

import { getDefaultRouteForRole } from "@app/lib/routing/roleRouting";

export const { OPTIONS, POST } = createExchangeCodeRouteHandlers({
  allowedOrigins: generateAllowedOrigins(),
  routeLogPrefix: "[app:/api/auth/exchange-code]",
  exchangeRedirectTransform: (parsed: OAuthTokenSuccessPayload) =>
    parsed.redirect_to === "/"
      ? getDefaultRouteForRole(parsed.user_role as UserRole)
      : parsed.redirect_to,
});
