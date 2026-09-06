import { hasSuperAccess } from "../../../../config/auth/super-access.mjs";

/**
 * Checks if the user has all the given permissions.
 *
 * @param {object} authCtx - The authentication context with user allowedpermissions.
 * @param {string[]} requiredPermissions - The permission group list to check.
 * @returns {boolean} True if the user has all the given permissions, false otherwise.
 */
export const hasPermission = (authCtx, requiredPermissions = []) => {
  if (!authCtx) return false;
  if (hasSuperAccess(authCtx.perms)) return true;

  const userPerms =
    typeof authCtx?.perms === "string"
      ? authCtx?.perms.split(" ")
      : authCtx?.perms || [];

  if (userPerms.length === 0) return false;

  return requiredPermissions.every((perm) => userPerms.includes(perm));
};
