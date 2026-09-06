import { normalizePermList } from "/opt/nodejs/config/auth/super-access.mjs";
import { ensureImplicitGrants } from "/opt/nodejs/constants/auth/permissions/role-permission-sets/implicit-grants.mjs";

/**
 * Build an authorizer context.
 *
 * @param {{
 *  id: string,
 *  cognitoSub: string,
 *  email?: string | null,
 *  role?: string | null,
 *  entityId?: string | null,
 *  perms?: string[] | string | null,
 * }} identity
 *
 * @returns {Object}
 */
export function buildAuthorizerContext(identity) {
  const role = identity.role || "";
  const have = ensureImplicitGrants(normalizePermList(identity.perms), role);

  return {
    identityId: identity.id,
    cognitoSub: identity.cognitoSub,
    email: identity.email || "",
    role,
    entityId: identity.entityId || "",
    perms: have.join(" "),
  };
}

/**
 * Get the permissions for an identity (role implicits merged).
 * @param {{
 *  perms?: string[] | string | null,
 *  role?: string | null,
 * }} identity
 * @returns {string[]}
 */
export function getIdentityPerms(identity) {
  return ensureImplicitGrants(
    normalizePermList(identity.perms),
    identity.role ?? null,
  );
}
