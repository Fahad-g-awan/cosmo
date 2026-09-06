import { PERMISSIONS_REGISTRY } from "../permissions.registry.mjs";

/**
 * Registry resources only admin identities may hold or be assigned.
 * Never included in manager/specialist/patient receivable sets or manager delegatable ceiling.
 * Shared resources with admin-only *actions* live in ADMIN_ONLY_ACTIONS instead.
 */
export const ADMIN_ONLY_RESOURCE_KEYS = Object.freeze([
  "admin",
  "lead",
  "blog",
  "blog_category",
  "announcement",
  "system_setting",
]);

/**
 * Registry actions on shared resources that only admins may hold or assign.
 * Non-admin receivable/delegatable sets use registry actions minus these.
 */
export const ADMIN_ONLY_ACTIONS = Object.freeze({
  clinic: Object.freeze(["create", "delete"]),
  clinic_category: Object.freeze(["create", "update", "delete"]),
  treatment: Object.freeze(["create", "update", "delete"]),
  treatment_category: Object.freeze(["create", "update", "delete"]),
  treatment_brand: Object.freeze(["create", "update", "delete"]),
});

/**
 * @param {string} resource
 * @returns {readonly string[]}
 */
export const getAdminOnlyActionsForResource = (resource) =>
  ADMIN_ONLY_ACTIONS[resource] ?? [];

/**
 * @param {string} resource
 * @param {readonly string[]} actions
 * @returns {string[]}
 */
export const withoutAdminOnlyActions = (resource, actions) => {
  const blocked = new Set(getAdminOnlyActionsForResource(resource));
  return actions.filter((action) => !blocked.has(action));
};

/**
 * @param {readonly string[]} resourceKeys
 * @param {{ stripAdminOnlyActions?: boolean }} [options]
 * @returns {string[]}
 */
export const flattenGrantsForResourceKeys = (
  resourceKeys,
  { stripAdminOnlyActions = false } = {},
) =>
  [
    ...new Set(
      resourceKeys.flatMap((resource) => {
        const registryActions = PERMISSIONS_REGISTRY[resource] ?? [];
        const actions = stripAdminOnlyActions
          ? withoutAdminOnlyActions(resource, registryActions)
          : registryActions;
        return actions.map((action) => `${resource}:${action}`);
      }),
    ),
  ];

/**
 * @returns {string[]}
 */
export const flattenAdminOnlyActionGrants = () =>
  Object.freeze(
    Object.entries(ADMIN_ONLY_ACTIONS).flatMap(([resource, actions]) =>
      actions.map((action) => `${resource}:${action}`),
    ),
  );
