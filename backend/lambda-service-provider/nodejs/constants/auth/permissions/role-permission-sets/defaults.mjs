import { resolveIdentityPerms } from "../../../../config/auth/super-access.mjs";
import { PATIENT_RECEIVABLE_GRANTS } from "./receivable.mjs";
import { USER_ROLES } from "../../roles.constants.mjs";

/** Shared default grants for management roles (admin, manager, specialist). */
const MANAGEMENT_ROLE_DEFAULT_GRANTS = [
  "profile:read",
  "profile:update",
  "image:upload",
  "platform:navigation",
  "platform:constants",
  "security:update",
];

const ADMIN_ROLE_DEFAULT_GRANTS = [
  ...MANAGEMENT_ROLE_DEFAULT_GRANTS,
  "platform:logs",
];

/**
 * Default grants applied when a new identity is provisioned.
 * Patient defaults are derived from receivable grants so create-time perms
 * never drift from what the role may hold (e.g. review:*).
 */
export const ROLE_DEFAULT_GRANTS = Object.freeze({
  [USER_ROLES.ADMIN]: ADMIN_ROLE_DEFAULT_GRANTS,
  [USER_ROLES.MANAGER]: MANAGEMENT_ROLE_DEFAULT_GRANTS,
  [USER_ROLES.SPECIALIST]: MANAGEMENT_ROLE_DEFAULT_GRANTS,
  [USER_ROLES.PATIENT]: PATIENT_RECEIVABLE_GRANTS,
});

/**
 * Resolved default grants for identity create flows (implicit grants merged).
 * @param {string} role
 * @returns {string[]}
 */
export const getRoleDefaultGrants = (role) =>
  resolveIdentityPerms({
    targetRole: role,
    defaultPerms: [...(ROLE_DEFAULT_GRANTS[role] ?? [])],
  });
