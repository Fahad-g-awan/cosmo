import { USER_ROLES } from "../../roles.constants.mjs";

/**
 * Grants always merged on identity create/update — never shown in assignment UI.
 */
export const IMPLICIT_GRANTS = Object.freeze([
  "platform:navigation",
  "platform:constants",
]);

/**
 * Role-specific grants always merged for that identity role — never shown in assignment UI.
 * Managers/specialists get patient CRUD so clinic patient create works without picker assignment.
 */
export const ROLE_IMPLICIT_GRANTS = Object.freeze({
  [USER_ROLES.MANAGER]: Object.freeze([
    "patient:read",
    "patient:create",
    "patient:update",
    "patient:delete",
  ]),
  [USER_ROLES.SPECIALIST]: Object.freeze([
    "patient:read",
    "patient:create",
    "patient:update",
    "patient:delete",
  ]),
});

/**
 * @param {string | null | undefined} role
 * @returns {readonly string[]}
 */
export const getImplicitGrantsForRole = (role) => {
  const roleKey = String(role ?? "").trim();
  const roleImplicit = ROLE_IMPLICIT_GRANTS[roleKey] ?? [];
  return Object.freeze([...new Set([...IMPLICIT_GRANTS, ...roleImplicit])]);
};

/**
 * @param {string[] | string | null | undefined} grants
 * @param {string | null | undefined} [role]
 * @returns {string[]}
 */
export const ensureImplicitGrants = (grants, role = null) => {
  const list = Array.isArray(grants)
    ? grants.filter(Boolean)
    : String(grants ?? "")
        .split(" ")
        .filter(Boolean);

  return Object.freeze([
    ...new Set([...list, ...getImplicitGrantsForRole(role)]),
  ]);
};

/**
 * @param {string} grant
 * @param {string | null | undefined} [role]
 * @returns {boolean}
 */
export const isImplicitGrant = (grant, role = null) =>
  getImplicitGrantsForRole(role).includes(grant);
