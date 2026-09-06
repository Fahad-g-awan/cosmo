import { ROUTE_ACCESS } from "../../../config/routes/route-access.constants.mjs";
import { hasSuperAccess } from "../../../config/auth/super-access.mjs";

/**
 * This function is used to check if a given set of permissions has access to a given route.
 *
 * @param {string[] | string} have
 * @param {{ mode?: "any" | "all", actions?: string[] } | null | undefined} policy
 */
export function canAccessRoute(have, policy) {
  if (hasSuperAccess(have)) return true;
  if (!policy?.actions?.length) return false;

  const granted = Array.isArray(have)
    ? have
    : String(have ?? "")
        .split(" ")
        .filter(Boolean);
  const set = new Set(granted);

  return policy.mode === "all"
    ? policy.actions.every((perm) => set.has(perm))
    : policy.actions.some((perm) => set.has(perm));
}

/**
 * This function is used to check if a given route definition has access to a given set of permissions.
 *
 * @param {import("../../../config/routes/_builders.mjs").RouteDef | undefined} routeDef
 * @param {string[] | string} have
 * @param {Record<string, import("../../../config/routes/_policy.helpers.mjs").RouteAccessPolicy>} routePolicies
 */
export function canAccessRegisteredRoute(routeDef, have, routePolicies) {
  if (!routeDef) return false;

  if (
    routeDef.access === ROUTE_ACCESS.PUBLIC ||
    routeDef.access === ROUTE_ACCESS.AUTH_ONLY
  ) {
    return true;
  }

  const policy = routePolicies[routeDef.key] ?? routeDef.policy?.() ?? null;
  return canAccessRoute(have, policy);
}
