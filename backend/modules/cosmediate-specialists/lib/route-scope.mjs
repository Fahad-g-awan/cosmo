import { SPECIALISTS_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/specialists.routes.mjs";
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
