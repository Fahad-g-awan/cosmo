import { ROUTE_ACCESS } from "./route-access.constants.mjs";

/**
 * @typedef {import("./route-access.constants.mjs").RouteAccessValue} RouteAccess
 * @typedef {{ key: string, access: RouteAccess, policy?: () => import("./_policy.helpers.mjs").RouteAccessPolicy, crudAction?: string, maintenanceAllow?: boolean }} RouteDef
 */

/** @param {Record<string, RouteDef>[]} routeDefGroups */
export const buildRouteRegistry = (routeDefGroups) => {
  const byKey = {};
  for (const group of routeDefGroups) {
    for (const def of Object.values(group)) {
      if (byKey[def.key]) {
        throw new Error(`Duplicate route key: ${def.key}`);
      }
      byKey[def.key] = def;
    }
  }
  return Object.freeze(byKey);
};

/** @param {Record<string, RouteDef>[]} routeDefGroups */
export const buildRoutePolicies = (routeDefGroups) => {
  const registry = buildRouteRegistry(routeDefGroups);
  const policies = {};

  for (const [key, def] of Object.entries(registry)) {
    if (def.access !== ROUTE_ACCESS.PERMISSIONED || !def.policy) continue;
    policies[key] = def.policy();
  }

  return Object.freeze(policies);
};

/** @param {Record<string, RouteDef>[]} routeDefGroups */
export const buildMaintenanceAllowlist = (routeDefGroups) => {
  const keys = [];
  for (const group of routeDefGroups) {
    for (const def of Object.values(group)) {
      if (def.maintenanceAllow) keys.push(def.key);
    }
  }
  return Object.freeze(new Set(keys));
};
