/** @typedef {{ mode: "any" | "all", actions: string[] }} RouteAccessPolicy */

export const anyOf = (...actions) => ({ mode: "any", actions });

export const allOf = (...actions) => ({ mode: "all", actions });
