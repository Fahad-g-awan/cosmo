import { REVIEW_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/review.routes.mjs";
import { ROUTE_ACCESS } from "/opt/nodejs/config/routes/route-access.constants.mjs";

const MANAGEMENT_ROUTE_KEYS = new Set(
  Object.values(R)
    .filter((def) => def.key?.includes("/management/"))
    .map((def) => def.key),
);

export const PUBLIC_ROUTE_KEYS = new Set(
  Object.values(R)
    .filter((def) => def.access === ROUTE_ACCESS.PUBLIC)
    .map((def) => def.key),
);

/** @param {string|null|undefined} routeKey */
export const isManagementRoute = (routeKey) =>
  MANAGEMENT_ROUTE_KEYS.has(routeKey ?? "");

/** @param {string|null|undefined} routeKey */
export const isPublicRoute = (routeKey) => PUBLIC_ROUTE_KEYS.has(routeKey ?? "");

/** Public review/reply lists only expose published content. */
export const resolveReviewListFilters = (routeKey, filters = {}) => {
  if (routeKey === R.LIST.key || routeKey === R.REPLY_LIST.key) {
    return { ...filters, status: "PUBLISHED" };
  }
  return filters;
};
