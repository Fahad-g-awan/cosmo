import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import {
  ROUTE_REGISTRY,
  ROUTE_POLICIES,
} from "/opt/nodejs/config/routes/index.mjs";
import { canAccessRegisteredRoute } from "/opt/nodejs/lib/auth/authorization/route-access.mjs";
import { validateApiRequest } from "/opt/nodejs/lib/validation/ajv/api-validator.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

export const postRouteAccess = async () => {
  try {
    const { reqBody } = getRequestContext();
    const { value } = validateApiRequest(
      CRUD_ACTIONS.LAMBDA_TEST.ROUTE_ACCESS,
      reqBody,
    );

    const routeDef = ROUTE_REGISTRY[value.routeKey] ?? null;
    const allowed = canAccessRegisteredRoute(
      routeDef,
      value.perms,
      ROUTE_POLICIES,
    );

    return {
      statusCode: 200,
      data: {
        success: true,
        routeKey: value.routeKey,
        routeRegistered: Boolean(routeDef),
        access: routeDef?.access ?? null,
        allowed,
      },
    };
  } catch (error) {
    console.error("Error at postRouteAccess", error);
    rethrowOrInternal(error);
  }
};
