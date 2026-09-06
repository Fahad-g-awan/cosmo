import { CLINIC_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/clinic.routes.mjs";
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

/** Public category list returns published catalog only. */
export const resolveClinicCategoryListFilters = (routeKey, filters = {}) => {
  if (routeKey === R.CATEGORY_LIST.key) {
    return { ...filters, published: true };
  }
  return filters;
};
