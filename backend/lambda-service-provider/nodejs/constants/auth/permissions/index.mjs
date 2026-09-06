import {
  PERMISSIONS_REGISTRY,
  RESOURCE_LABELS,
} from "./permissions.registry.mjs";
import {
  flattenRegistryGrants,
  buildPermissionGroupsFromRegistry,
} from "./registry.utils.mjs";
import { PLATFORM_NAVIGATION } from "./platform.navigation.mjs";
import {
  GRANT_TARGET_ROLES_BY_GRANTER,
  GRANTER_ROLES,
  GRANT_SCOPE_BY_GRANTER_ROLE,
} from "./grant-rules.mjs";
import {
  ROLE_DEFAULT_GRANTS,
  getRoleDefaultGrants,
} from "./role-permission-sets/defaults.mjs";
import {
  ADMIN_ONLY_ACTIONS,
  ADMIN_ONLY_RESOURCE_KEYS,
} from "./role-permission-sets/admin-only.mjs";
import {
  MANAGER_DELEGATABLE_RESOURCE_KEYS,
  MANAGER_DELEGATABLE_GRANTS,
  adminOnlyActionsExcludedFromManagerDelegatable,
  adminOnlyResourcesExcludedFromManagerDelegatable,
} from "./role-permission-sets/assignable-ceiling.mjs";
import {
  ROLE_RECEIVABLE_RESOURCE_KEYS,
  ROLE_RECEIVABLE_GRANTS,
  getReceivableGrants,
  MANAGER_RECEIVABLE_RESOURCE_KEYS,
  PATIENT_RECEIVABLE_RESOURCE_KEYS,
  SPECIALIST_RECEIVABLE_RESOURCE_KEYS,
  adminOnlyActionsScopedToAdmin,
  adminOnlyResourcesScopedToAdmin,
  managerDelegatableGrantsWithinManagerReceivable,
} from "./role-permission-sets/receivable.mjs";
import {
  IMPLICIT_GRANTS,
  ROLE_IMPLICIT_GRANTS,
  ensureImplicitGrants,
  getImplicitGrantsForRole,
  isImplicitGrant,
} from "./role-permission-sets/implicit-grants.mjs";

export {
  PERMISSIONS_REGISTRY,
  RESOURCE_LABELS,
  PLATFORM_NAVIGATION,
  GRANT_TARGET_ROLES_BY_GRANTER,
  GRANTER_ROLES,
  GRANT_SCOPE_BY_GRANTER_ROLE,
  ROLE_DEFAULT_GRANTS,
  getRoleDefaultGrants,
  ADMIN_ONLY_ACTIONS,
  ADMIN_ONLY_RESOURCE_KEYS,
  MANAGER_DELEGATABLE_RESOURCE_KEYS,
  MANAGER_DELEGATABLE_GRANTS,
  adminOnlyActionsExcludedFromManagerDelegatable,
  adminOnlyResourcesExcludedFromManagerDelegatable,
  ROLE_RECEIVABLE_RESOURCE_KEYS,
  ROLE_RECEIVABLE_GRANTS,
  getReceivableGrants,
  MANAGER_RECEIVABLE_RESOURCE_KEYS,
  PATIENT_RECEIVABLE_RESOURCE_KEYS,
  SPECIALIST_RECEIVABLE_RESOURCE_KEYS,
  adminOnlyActionsScopedToAdmin,
  adminOnlyResourcesScopedToAdmin,
  managerDelegatableGrantsWithinManagerReceivable,
  IMPLICIT_GRANTS,
  ROLE_IMPLICIT_GRANTS,
  ensureImplicitGrants,
  getImplicitGrantsForRole,
  isImplicitGrant,
  flattenRegistryGrants,
  buildPermissionGroupsFromRegistry,
};

/** Flat grant strings for every resource in the registry. */
export const GRANT_REGISTRY = Object.freeze(flattenRegistryGrants());

/** Nested PERMISSIONS object for route policies — e.g. PERMISSIONS.PATIENT.READ */
export const PERMISSIONS = Object.freeze(
  buildPermissionGroupsFromRegistry(Object.keys(PERMISSIONS_REGISTRY)),
);
