import { assertMaintenanceNotBlocking } from "../platform/maintenance-gate.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { stripEnvStage } from "../http/stage.utils.mjs";
import { httpError } from "../errors/http-error.mjs";

/**
 * Dispatch the route to the controller by normalizing the
 * route and getting the controller from the routes map.
 *
 * @param {object} event - The event object.
 * @param {string} env - The environment.
 * @param {Map} ROUTES - The routes map.
 *
 * @returns {Promise<object>} The controller result.
 * @throws {Error} If the route is not found.
 */
export const dispatchRoute = async (event, env, ROUTES) => {
  const routeKey = normalizeRoute(event, env);
  await assertMaintenanceNotBlocking(routeKey);
  const controller = ROUTES.get(routeKey);

  if (!controller) {
    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      details: [`Unknown route ${routeKey}`],
    });
  }

  return controller();
};

/**
 * Get the method and path from the event.
 *
 * @param {object} event - The event object.
 * @returns {object} The method and path.
 */
export const getMethodAndPath = (event) => {
  // HTTP API v2:
  if (event.requestContext?.http) {
    return {
      method: event.requestContext.http.method,
      path: event.rawPath || event.requestContext.http.path || event.path,
    };
  }
  // REST API v1:
  return { method: event.httpMethod, path: event.path };
};

/**
 * Normalize the route by stripping the environment stage from the path.
 *
 * @param {object} event - The event object.
 * @param {string} env - The environment.
 * @returns {string} The normalized route.
 */
export const normalizeRoute = (event, env) => {
  const { method, path } = getMethodAndPath(event);
  return `${method.toUpperCase()}:${stripEnvStage(path, env)}`;
};
