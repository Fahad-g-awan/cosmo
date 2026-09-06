import { ensureImplicitGrants } from "../../constants/auth/permissions/role-permission-sets/implicit-grants.mjs";
import { USER_ROLES } from "../../constants/auth/roles.constants.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../../lib/errors/http-error.mjs";

export const SUPER_ACCESS_GRANT = "*:*";

/**
 * Normalize a permission list.
 * @param {string[] | string | null | undefined} perms
 * @returns {string[]}
 */
export const normalizePermList = (perms) => {
  if (Array.isArray(perms)) {
    return perms.filter(Boolean);
  }
  return String(perms ?? "")
    .split(" ")
    .filter(Boolean);
};

/**
 * Check if a permission list has super access.
 * @param {string[] | string | null | undefined} perms
 * @returns {boolean}
 */
export const hasSuperAccess = (perms) =>
  normalizePermList(perms).includes(SUPER_ACCESS_GRANT);

/** Only ADMIN role may assign or modify super access on other identities. */
export const canGrantSuperAccess = (granterRole) =>
  granterRole === USER_ROLES.ADMIN;

/**
 * Normalize requested grants.
 * @param {string[] | null | undefined} perms
 * @returns {string[]}
 */
export const normalizeRequestedGrants = (perms) => {
  const list = normalizePermList(perms);
  if (list.includes(SUPER_ACCESS_GRANT)) {
    return [SUPER_ACCESS_GRANT];
  }
  return [...new Set(list)];
};

/**
 * Resolves Identity.perms for create flows.
 * Uses defaultPerms when the caller omits or sends an empty list.
 * Merges role-specific implicit grants for `targetRole` (hidden from assignment UI).
 *
 * @param {{
 *   requestedPerms?: string[] | null,
 *   granterRole?: string | null,
 *   targetRole?: string | null,
 *   defaultPerms?: string[],
 * }} input
 */
export const resolveIdentityPerms = ({
  requestedPerms,
  granterRole,
  targetRole = null,
  defaultPerms = [],
}) => {
  const hasExplicit =
    Array.isArray(requestedPerms) && requestedPerms.length > 0;

  if (!hasExplicit) {
    return ensureImplicitGrants(
      normalizeRequestedGrants(defaultPerms),
      targetRole,
    );
  }

  if (
    normalizePermList(requestedPerms).includes(SUPER_ACCESS_GRANT) &&
    !canGrantSuperAccess(granterRole)
  ) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Only admins may assign super access."],
    });
  }

  return ensureImplicitGrants(
    normalizeRequestedGrants(requestedPerms),
    targetRole,
  );
};

/** Returns `["*:*"]` for code paths that default new admins to super access. */
export const withSuperAccess = () => [SUPER_ACCESS_GRANT];
