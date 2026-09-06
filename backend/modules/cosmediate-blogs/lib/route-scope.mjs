import { ROUTE_ACCESS } from "/opt/nodejs/config/routes/route-access.constants.mjs";
import { BLOG_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/blog.routes.mjs";

const MANAGEMENT_ROUTE_KEYS = new Set([
  R.MANAGEMENT_GET_ONE.key,
  R.MANAGEMENT_LIST.key,
  R.MANAGEMENT_CATEGORY_GET_ONE.key,
  R.MANAGEMENT_CATEGORY_LIST.key,
]);

export const isManagementRoute = (routeKey) =>
  MANAGEMENT_ROUTE_KEYS.has(routeKey);

export const isPublicRoute = (routeKey) => {
  const def = Object.values(R).find((entry) => entry.key === routeKey);
  return def?.access === ROUTE_ACCESS.PUBLIC;
};
