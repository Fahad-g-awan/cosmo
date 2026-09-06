import { SUPER_ACCESS_GRANT } from "../../../../config/auth/super-access.mjs";
import {
  MANAGER_DELEGATABLE_GRANTS,
  MANAGER_DELEGATABLE_RESOURCE_KEYS,
} from "./assignable-ceiling.mjs";
import { PERMISSIONS_REGISTRY } from "../permissions.registry.mjs";
import { flattenRegistryGrants } from "../registry.utils.mjs";
import {
  ADMIN_ONLY_RESOURCE_KEYS,
  flattenAdminOnlyActionGrants,
  withoutAdminOnlyActions,
} from "./admin-only.mjs";
import { getImplicitGrantsForRole } from "./implicit-grants.mjs";
import { USER_ROLES } from "../../roles.constants.mjs";

/**
 * Per-resource action allowlist when a role may hold only a subset of registry actions.
 */
export const ROLE_RECEIVABLE_ACTION_OVERRIDES = Object.freeze({
  [USER_ROLES.PATIENT]: Object.freeze({
    appointment: Object.freeze(["read", "create", "cancel"]),
  }),
  [USER_ROLES.MANAGER]: Object.freeze({
    review: Object.freeze(["read"]),
  }),
  [USER_ROLES.SPECIALIST]: Object.freeze({
    treatment: Object.freeze(["read"]),
    sub_treatment: Object.freeze(["read"]),
    treatment_result: Object.freeze(["read"]),
    review: Object.freeze(["read"]),
  }),
});

/**
 * Registry resource keys a clinic manager identity may hold.
 */
export const MANAGER_RECEIVABLE_RESOURCE_KEYS = Object.freeze([
  "profile",
  "security",
  "permissions",
  "image",
  "specialist",
  "clinic_manager",
  "clinic",
  "clinic_category",
  "treatment_category",
  "treatment",
  "sub_treatment",
  "treatment_result",
  "treatment_brand",
  "review",
  "review_reply",
  "appointment",
  "inbox",
  "schedule",
]);

/**
 * Specialist dashboard receivable resources (narrower than manager).
 * No specialist/clinic/clinic_manager/permissions/brands/categories/patient;
 * treatment suite is read-only via overrides. Patient CRUD is role-implicit.
 */
export const SPECIALIST_RECEIVABLE_RESOURCE_KEYS = Object.freeze([
  "profile",
  "security",
  "image",
  "treatment",
  "sub_treatment",
  "treatment_result",
  "review",
  "review_reply",
  "appointment",
  "inbox",
  "schedule",
]);

/** @type {readonly string[]} */
export const PATIENT_RECEIVABLE_RESOURCE_KEYS = Object.freeze([
  "profile",
  "security",
  "image",
  "appointment",
  "inbox",
  "review",
]);

/** Full registry — includes ADMIN_ONLY_RESOURCE_KEYS. */
export const ADMIN_RECEIVABLE_RESOURCE_KEYS = Object.freeze(
  Object.keys(PERMISSIONS_REGISTRY),
);

export const ROLE_RECEIVABLE_RESOURCE_KEYS = Object.freeze({
  [USER_ROLES.PATIENT]: PATIENT_RECEIVABLE_RESOURCE_KEYS,
  [USER_ROLES.MANAGER]: MANAGER_RECEIVABLE_RESOURCE_KEYS,
  [USER_ROLES.SPECIALIST]: SPECIALIST_RECEIVABLE_RESOURCE_KEYS,
  [USER_ROLES.ADMIN]: ADMIN_RECEIVABLE_RESOURCE_KEYS,
});

const resolveReceivableActions = (resource, role, actionOverrides) => {
  if (actionOverrides?.[resource]) {
    return actionOverrides[resource];
  }

  const registryActions = PERMISSIONS_REGISTRY[resource] ?? [];
  if (role === USER_ROLES.ADMIN) {
    return registryActions;
  }

  return withoutAdminOnlyActions(resource, registryActions);
};

const buildReceivableGrants = (resourceKeys, role = null) => {
  const actionOverrides =
    role != null ? ROLE_RECEIVABLE_ACTION_OVERRIDES[role] : null;

  const grants = [
    ...new Set(
      resourceKeys.flatMap((resource) => {
        const actions = resolveReceivableActions(
          resource,
          role,
          actionOverrides,
        );
        return actions.map((action) => `${resource}:${action}`);
      }),
    ),
  ];

  const merged = [
    ...new Set([...grants, ...getImplicitGrantsForRole(role)]),
  ];
  return Object.freeze(merged);
};

export const PATIENT_RECEIVABLE_GRANTS = buildReceivableGrants(
  PATIENT_RECEIVABLE_RESOURCE_KEYS,
  USER_ROLES.PATIENT,
);

export const MANAGER_RECEIVABLE_GRANTS = Object.freeze([
  ...buildReceivableGrants(
    MANAGER_RECEIVABLE_RESOURCE_KEYS,
    USER_ROLES.MANAGER,
  ),
  "platform:logs",
]);

export const SPECIALIST_RECEIVABLE_GRANTS = buildReceivableGrants(
  SPECIALIST_RECEIVABLE_RESOURCE_KEYS,
  USER_ROLES.SPECIALIST,
);

export const ADMIN_RECEIVABLE_GRANTS = Object.freeze([
  ...flattenRegistryGrants(ADMIN_RECEIVABLE_RESOURCE_KEYS),
  SUPER_ACCESS_GRANT,
]);

export const ROLE_RECEIVABLE_GRANTS = Object.freeze({
  [USER_ROLES.PATIENT]: PATIENT_RECEIVABLE_GRANTS,
  [USER_ROLES.MANAGER]: MANAGER_RECEIVABLE_GRANTS,
  [USER_ROLES.SPECIALIST]: SPECIALIST_RECEIVABLE_GRANTS,
  [USER_ROLES.ADMIN]: ADMIN_RECEIVABLE_GRANTS,
});

/**
 * @param {string | null | undefined} targetRole
 * @returns {readonly string[]}
 */
export const getReceivableGrants = (targetRole) => {
  const role = String(targetRole ?? "").trim();
  return ROLE_RECEIVABLE_GRANTS[role] ?? [];
};

/** True when every manager-delegatable resource is manager-receivable. */
export const managerDelegatableWithinManagerReceivable = () =>
  MANAGER_DELEGATABLE_RESOURCE_KEYS.every((key) =>
    MANAGER_RECEIVABLE_RESOURCE_KEYS.includes(key),
  );

/** True when admin-only resources are admin-receivable but not receivable by other roles. */
export const adminOnlyResourcesScopedToAdmin = () => {
  const nonAdminReceivable = [
    ...MANAGER_RECEIVABLE_RESOURCE_KEYS,
    ...SPECIALIST_RECEIVABLE_RESOURCE_KEYS,
    ...PATIENT_RECEIVABLE_RESOURCE_KEYS,
  ];

  return ADMIN_ONLY_RESOURCE_KEYS.every(
    (key) =>
      ADMIN_RECEIVABLE_RESOURCE_KEYS.includes(key) &&
      !nonAdminReceivable.includes(key),
  );
};

/** True when admin-only actions are admin-receivable but not receivable by other roles. */
export const adminOnlyActionsScopedToAdmin = () => {
  const nonAdminGrants = [
    ...MANAGER_RECEIVABLE_GRANTS,
    ...SPECIALIST_RECEIVABLE_GRANTS,
    ...PATIENT_RECEIVABLE_GRANTS,
  ];

  return flattenAdminOnlyActionGrants().every(
    (grant) =>
      ADMIN_RECEIVABLE_GRANTS.includes(grant) &&
      !nonAdminGrants.includes(grant),
  );
};

/** True when every manager-delegatable grant is manager-receivable. */
export const managerDelegatableGrantsWithinManagerReceivable = () =>
  MANAGER_DELEGATABLE_GRANTS.every((grant) =>
    MANAGER_RECEIVABLE_GRANTS.includes(grant),
  );
