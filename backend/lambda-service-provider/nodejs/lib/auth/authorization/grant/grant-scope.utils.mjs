import {
  GRANT_REGISTRY,
  PERMISSIONS_REGISTRY,
  PERMISSIONS,
  buildPermissionGroupsFromRegistry,
  getReceivableGrants,
  GRANTER_ROLES,
  GRANT_TARGET_ROLES_BY_GRANTER,
  GRANT_SCOPE_BY_GRANTER_ROLE,
  isImplicitGrant,
} from "../../../../constants/auth/permissions/index.mjs";
import {
  SUPER_ACCESS_GRANT,
  canGrantSuperAccess,
  hasSuperAccess,
  normalizePermList,
  normalizeRequestedGrants,
} from "../../../../config/auth/super-access.mjs";
import { USER_ROLES } from "../../../../constants/auth/roles.constants.mjs";
import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../errors/http-error.mjs";

const granterMayAssignPerms = (granterGrants) => {
  const perms = normalizePermList(granterGrants);
  return hasSuperAccess(perms) || perms.includes(PERMISSIONS.PERMISSIONS.GRANT);
};

const superAccessMeta = (granterRole, targetRole = null) => ({
  grant: SUPER_ACCESS_GRANT,
  canGrant:
    canGrantSuperAccess(granterRole) &&
    (!targetRole || targetRole === USER_ROLES.ADMIN),
});

const appendSuperToGrants = (grants, granterRole, targetRole = null) => {
  if (!canGrantSuperAccess(granterRole)) return grants;
  if (targetRole && targetRole !== USER_ROLES.ADMIN) return grants;
  if (grants.includes(SUPER_ACCESS_GRANT)) return grants;
  return [...grants, SUPER_ACCESS_GRANT];
};

const filterGroupsByGrants = (groups, allowedGrants) => {
  const allowed = new Set(allowedGrants);

  return Object.fromEntries(
    Object.entries(groups)
      .map(([groupKey, actions]) => {
        const filtered = Object.fromEntries(
          Object.entries(actions).filter(([, grant]) => allowed.has(grant)),
        );
        return [groupKey, filtered];
      })
      .filter(([, actions]) => Object.keys(actions).length > 0),
  );
};

const intersectGrants = (left, right) => {
  const allowed = new Set(right);
  return left.filter((grant) => allowed.has(grant));
};

export const resolveGrantScope = (granterRole) =>
  GRANT_SCOPE_BY_GRANTER_ROLE[granterRole] ?? null;

export const canRoleGrantPermissions = (granterRole) =>
  GRANTER_ROLES.includes(granterRole);

export const canGrantToTargetRole = (granterRole, targetRole) => {
  const allowed = GRANT_TARGET_ROLES_BY_GRANTER[granterRole];
  return Array.isArray(allowed) && allowed.includes(targetRole);
};

export const getDelegatableGrants = (
  granterRole,
  granterGrants = [],
  targetRole = null,
) => {
  if (hasSuperAccess(granterGrants)) {
    const grants = appendSuperToGrants(GRANT_REGISTRY, granterRole, targetRole);
    if (targetRole) {
      return intersectGrants(grants, getReceivableGrants(targetRole));
    }
    return grants;
  }

  const scope = resolveGrantScope(granterRole);
  if (!scope) return [];

  const ceiling = scope.allGrants
    ? GRANT_REGISTRY
    : (scope.delegatableGrants ?? []);

  const held = new Set(normalizePermList(granterGrants));
  let grants = ceiling.filter((grant) => held.has(grant));

  grants = appendSuperToGrants(grants, granterRole, targetRole);

  if (targetRole) {
    grants = intersectGrants(grants, getReceivableGrants(targetRole));
  }

  return grants;
};

export const getGrantCatalog = (
  granterRole,
  granterGrants = [],
  targetRole = null,
) => {
  const superAccess = superAccessMeta(granterRole, targetRole);
  const effectiveGrants = getDelegatableGrants(
    granterRole,
    granterGrants,
    targetRole,
  );

  const groups = filterGroupsByGrants(
    buildPermissionGroupsFromRegistry(Object.keys(PERMISSIONS_REGISTRY)),
    effectiveGrants.filter((grant) => !isImplicitGrant(grant, targetRole)),
  );

  const catalogGrants = effectiveGrants.filter(
    (grant) => !isImplicitGrant(grant, targetRole),
  );

  return {
    groups,
    grants: catalogGrants,
    superAccess,
  };
};

/**
 * @param {{
 *   granterRole: string,
 *   granterGrants?: string[] | string,
 *   targetRole: string,
 *   targetCurrentGrants?: string[] | string,
 *   requestedGrants: string[],
 * }} input
 */
export const assertGrantRequest = ({
  granterRole,
  granterGrants = [],
  targetRole,
  targetCurrentGrants = [],
  requestedGrants = [],
}) => {
  if (!canRoleGrantPermissions(granterRole)) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["This role is not allowed to grant permissions."],
    });
  }

  if (!canGrantToTargetRole(granterRole, targetRole)) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: [`Cannot grant permissions to role ${targetRole}.`],
    });
  }

  if (!granterMayAssignPerms(granterGrants)) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["permissions:grant is required to assign permissions."],
    });
  }

  const normalized = normalizeRequestedGrants(requestedGrants);
  const targetHasSuper = hasSuperAccess(targetCurrentGrants);
  const requestsSuper = normalized.includes(SUPER_ACCESS_GRANT);

  if (requestsSuper && targetRole !== USER_ROLES.ADMIN) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Super access may only be assigned to admin identities."],
    });
  }

  if (requestsSuper && !canGrantSuperAccess(granterRole)) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Only admins may assign super access."],
    });
  }

  if (targetHasSuper && !canGrantSuperAccess(granterRole)) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Only admins may modify permissions for super-access users."],
    });
  }

  if (requestsSuper && canGrantSuperAccess(granterRole)) {
    return true;
  }

  if (hasSuperAccess(granterGrants)) {
    const receivable = new Set(getReceivableGrants(targetRole));
    const invalidReceivable = normalized.filter(
      (grant) => !receivable.has(grant),
    );
    if (invalidReceivable.length > 0) {
      throw httpError({
        error: API_ERRORS.FORBIDDEN,
        details: [
          "Grant scope violation — requested permissions exceed what this role may hold.",
          ...invalidReceivable.map((grant) => `Not receivable: ${grant}`),
        ],
      });
    }
    return true;
  }

  const receivable = new Set(getReceivableGrants(targetRole));
  const invalidReceivable = normalized.filter(
    (grant) => !receivable.has(grant),
  );
  if (invalidReceivable.length > 0) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: [
        "Grant scope violation — requested permissions exceed what this role may hold.",
        ...invalidReceivable.map((grant) => `Not receivable: ${grant}`),
      ],
    });
  }

  const delegatable = new Set(
    getDelegatableGrants(granterRole, granterGrants, targetRole),
  );
  const assignableGrants = normalized.filter(
    (grant) => !isImplicitGrant(grant, targetRole),
  );
  const invalid = assignableGrants.filter((grant) => !delegatable.has(grant));

  if (invalid.length > 0) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: [
        "Grant scope violation — requested permissions exceed what you may assign.",
        ...invalid.map((grant) => `Not delegatable: ${grant}`),
      ],
    });
  }

  return true;
};
