/** Route access levels for the API authorizer and route registry. */
export const ROUTE_ACCESS = Object.freeze({
  PUBLIC: "public",
  AUTH_ONLY: "auth_only",
  PERMISSIONED: "permissioned",
});

/** @typedef {(typeof ROUTE_ACCESS)[keyof typeof ROUTE_ACCESS]} RouteAccessValue */

export const ROUTE_ACCESS_VALUES = Object.freeze(Object.values(ROUTE_ACCESS));
