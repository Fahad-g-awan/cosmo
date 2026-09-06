import {
  httpError,
  rethrowOrInternal,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { normalizeRoute } from "/opt/nodejs/lib/routing/router.mjs";

export const getAuthProbe = async () => {
  try {
    const { authContext, env, event } = getRequestContext();
    const routeKey = normalizeRoute(event, env);

    if (!authContext?.identityId && !authContext?.cognitoSub) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["Authorizer context missing"],
      });
    }

    const hasRegistry = hasPermission(authContext, [PERMISSIONS.PLATFORM.CONSTANTS]);

    return {
      statusCode: 200,
      data: {
        success: true,
        authorizationWorking: hasRegistry,
        routeKey,
        context: {
          identityId: authContext.identityId ?? null,
          cognitoSub: authContext.cognitoSub ?? null,
          email: authContext.email ?? "",
          role: authContext.role ?? "",
          entityId: authContext.entityId ?? "",
          perms: authContext.perms ?? "",
        },
      },
    };
  } catch (error) {
    console.error("Error at getAuthProbe", error);
    rethrowOrInternal(error);
  }
};
