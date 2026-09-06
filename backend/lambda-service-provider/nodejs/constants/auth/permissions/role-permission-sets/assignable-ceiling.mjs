import {
  ADMIN_ONLY_RESOURCE_KEYS,
  flattenAdminOnlyActionGrants,
  flattenGrantsForResourceKeys,
} from "./admin-only.mjs";

/**
 * Registry resource keys a clinic manager may delegate (admin gets allGrants via scope).
 * ADMIN_ONLY_RESOURCE_KEYS and ADMIN_ONLY_ACTIONS are never delegatable by managers.
 */
export const MANAGER_DELEGATABLE_RESOURCE_KEYS = Object.freeze([
  "profile",
  "security",
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

/** Managers only hold/delegate review:read (patients still need full review:*). */
const isManagerDelegatableReviewGrant = (grant) =>
  !grant.startsWith("review:") || grant === "review:read";

export const MANAGER_DELEGATABLE_GRANTS = Object.freeze([
  ...flattenGrantsForResourceKeys(MANAGER_DELEGATABLE_RESOURCE_KEYS, {
    stripAdminOnlyActions: true,
  }).filter(isManagerDelegatableReviewGrant),
  "platform:logs",
]);

/** True when admin-only resources are excluded from the manager delegatable ceiling. */
export const adminOnlyResourcesExcludedFromManagerDelegatable = () =>
  ADMIN_ONLY_RESOURCE_KEYS.every(
    (key) => !MANAGER_DELEGATABLE_RESOURCE_KEYS.includes(key),
  );

/** True when admin-only actions are excluded from the manager delegatable ceiling. */
export const adminOnlyActionsExcludedFromManagerDelegatable = () =>
  flattenAdminOnlyActionGrants().every(
    (grant) => !MANAGER_DELEGATABLE_GRANTS.includes(grant),
  );
