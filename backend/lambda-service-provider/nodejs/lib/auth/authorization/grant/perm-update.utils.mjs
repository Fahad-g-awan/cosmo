import {
  hasSuperAccess,
  normalizePermList,
} from "../../../../config/auth/super-access.mjs";
import { isImplicitGrant } from "../../../../constants/auth/permissions/role-permission-sets/implicit-grants.mjs";
import { PERMISSIONS } from "../../../../constants/auth/permissions/index.mjs";
import { hasPermission } from "./permissions.utils.mjs";

const withoutImplicitGrants = (perms) =>
  normalizePermList(perms).filter((grant) => !isImplicitGrant(grant));

const permsAreEqual = (left, right) => {
  const a = [...new Set(withoutImplicitGrants(left))].sort();
  const b = [...new Set(withoutImplicitGrants(right))].sort();
  return a.length === b.length && a.every((grant, index) => grant === b[index]);
};

const canSelfUpdatePerms = (authContext) =>
  hasSuperAccess(authContext?.perms) ||
  hasPermission(authContext, [PERMISSIONS.PERMISSIONS.GRANT]);

/**
 * Whether an identity.perms write should be applied on update.
 * Self-updates are allowed only for super-access holders or users with permissions:grant.
 */
export const shouldApplyPermUpdate = ({
  isSelfUpdate,
  requestedPerms,
  currentPerms,
  authContext,
}) => {
  if (requestedPerms === undefined) return false;
  if (!Array.isArray(requestedPerms) || requestedPerms.length === 0) {
    return false;
  }
  if (permsAreEqual(requestedPerms, currentPerms)) return false;

  if (isSelfUpdate) {
    return canSelfUpdatePerms(authContext);
  }

  return true;
};
