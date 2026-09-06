import { MANAGER_DELEGATABLE_GRANTS } from "./role-permission-sets/assignable-ceiling.mjs";
import { USER_ROLES } from "../roles.constants.mjs";

/**
 * Which identity roles a granter may assign grants to.
 */
export const GRANT_TARGET_ROLES_BY_GRANTER = Object.freeze({
  [USER_ROLES.ADMIN]: [
    USER_ROLES.ADMIN,
    USER_ROLES.MANAGER,
    USER_ROLES.SPECIALIST,
    USER_ROLES.PATIENT,
  ],
  [USER_ROLES.MANAGER]: [USER_ROLES.SPECIALIST, USER_ROLES.MANAGER],
});

/**
 * Granter roles allowed to assign perms via profile update (must also hold permissions:grant).
 */
export const GRANTER_ROLES = Object.freeze([
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
]);

/**
 * Grant scopes by granter role.
 * @typedef {{ allGrants?: boolean, delegatableGrants?: string[] }} GrantScope
 * @type {Record<string, GrantScope>}
 */
export const GRANT_SCOPE_BY_GRANTER_ROLE = Object.freeze({
  [USER_ROLES.ADMIN]: {
    allGrants: true,
  },
  [USER_ROLES.MANAGER]: {
    delegatableGrants: MANAGER_DELEGATABLE_GRANTS,
  },
});
