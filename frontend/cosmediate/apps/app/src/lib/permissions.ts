import type { GrantCatalogGroup, PermissionsRegistryPayload } from "@cosmediate/api";
import type { PanelHeaderConfig } from "@app/types/shared";

export const SUPER_ACCESS_GRANT = "*:*";
export const PERMISSIONS_GRANT = "permissions:grant";

/** Fallback when registry not yet loaded from navigation API. */
export const FALLBACK_IMPLICIT_GRANTS = [
  "platform:navigation",
  "platform:constants",
] as const;

/** Match backend ROLE_IMPLICIT_GRANTS until registry loads. */
export const FALLBACK_ROLE_IMPLICIT_GRANTS: Record<string, readonly string[]> = {
  MANAGER: [
    "patient:read",
    "patient:create",
    "patient:update",
    "patient:delete",
  ],
  SPECIALIST: [
    "patient:read",
    "patient:create",
    "patient:update",
    "patient:delete",
  ],
};

export const getImplicitGrantsForRole = (
  role: string | null | undefined,
  globalImplicit: readonly string[] = FALLBACK_IMPLICIT_GRANTS,
  roleImplicitMap: Record<string, readonly string[] | string[]> = FALLBACK_ROLE_IMPLICIT_GRANTS,
): string[] => {
  const roleKey = String(role ?? "").trim();
  const roleImplicit = roleImplicitMap[roleKey] ?? [];
  return [...new Set([...globalImplicit, ...roleImplicit])];
};

export type CrudOperation = "read" | "create" | "update" | "delete";

export const userCanGrantPermissions = (perms: string[] = []): boolean =>
  perms.includes(SUPER_ACCESS_GRANT) || perms.includes(PERMISSIONS_GRANT);

export const hasSuperAccess = (perms: string[] = []): boolean =>
  perms.includes(SUPER_ACCESS_GRANT);

export const hasPermission = (
  perms: string[] = [],
  required: string | string[],
  mode: "any" | "all" = "any",
): boolean => {
  if (hasSuperAccess(perms)) return true;

  const requiredList = Array.isArray(required) ? required : [required];
  if (!requiredList.length) return true;

  if (mode === "all") {
    return requiredList.every((grant) => perms.includes(grant));
  }

  return requiredList.some((grant) => perms.includes(grant));
};

/** Alias used by platform navigation filtering. */
export const userHasAnyRequiredPerm = (
  userPerms: string[],
  requiredAny: string[],
): boolean => hasPermission(userPerms, requiredAny, "any");

export const buildGrantString = (
  resource: string,
  operation: string,
): string => `${resource}:${operation}`;

export const isImplicitGrant = (
  grant: string,
  implicitGrants: readonly string[] = FALLBACK_IMPLICIT_GRANTS,
): boolean => implicitGrants.includes(grant);

export const canCrud = (
  perms: string[] = [],
  resource: string,
  operation: CrudOperation,
  registry?: PermissionsRegistryPayload | null,
): boolean => {
  if (registry?.registry) {
    const allowedOps = registry.registry[resource];
    if (!allowedOps?.includes(operation)) return false;
  }

  return hasPermission(perms, buildGrantString(resource, operation));
};

export const canExport = (
  perms: string[] = [],
  resource: string,
  registry?: PermissionsRegistryPayload | null,
): boolean => canCrud(perms, resource, "read", registry);

export const filterImplicitGrants = (
  grants: string[],
  implicitGrants: readonly string[] = FALLBACK_IMPLICIT_GRANTS,
): string[] => grants.filter((grant) => !isImplicitGrant(grant, implicitGrants));

const RESOURCE_LABELS: Record<string, string> = {
  PROFILE: "Profile",
  SECURITY: "Security",
  PERMISSIONS: "Permissions",
  IMAGE: "Images",
  PLATFORM: "Platform",
  PATIENT: "Patients",
  ADMIN: "Admins",
  LEAD: "Leads",
  SPECIALIST: "Specialists",
  CLINIC_CATEGORY: "Clinic categories",
  CLINIC_MANAGER: "Clinic managers",
  CLINIC: "Clinics",
  TREATMENT_CATEGORY: "Treatment categories",
  TREATMENT: "Treatments",
  SUB_TREATMENT: "Sub-treatments",
  TREATMENT_RESULT: "Treatment results",
  TREATMENT_BRAND: "Treatment brands",
  REVIEW: "Reviews",
  REVIEW_REPLY: "Review replies",
  BLOG: "Blogs",
  BLOG_CATEGORY: "Blog categories",
  ANNOUNCEMENT: "Announcements",
  SYSTEM_SETTING: "System settings",
  APPOINTMENT: "Appointments",
  INBOX: "Inbox",
  SCHEDULE: "Schedule",
};

export const formatResourceGroupLabel = (groupKey: string): string =>
  RESOURCE_LABELS[groupKey] ??
  groupKey
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatSegment = (segment: string): string =>
  segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const formatGrantLabel = (grant: string): string => {
  if (grant === SUPER_ACCESS_GRANT) {
    return "Super access (all permissions)";
  }

  const [resource, action] = grant.split(":");
  const actionLabel = formatSegment(action ?? grant);
  if (resource) {
    return `${actionLabel} — ${formatSegment(resource)}`;
  }
  return grant;
};

const collectGrants = (
  node: unknown,
  path: string[] = [],
): Array<{ path: string; value: string }> => {
  if (typeof node === "string") {
    return [{ path: path.join("."), value: node }];
  }

  if (!node || typeof node !== "object") {
    return [];
  }

  return Object.entries(node as Record<string, unknown>).flatMap(
    ([key, value]) => collectGrants(value, [...path, key]),
  );
};

export interface PermissionGroupOption {
  groupKey: string;
  groupLabel: string;
  grants: Array<{ id: string; value: string; label: string }>;
};

export const buildPermissionGroups = (
  groups: Record<string, GrantCatalogGroup>,
  formatGroupLabel: (key: string) => string,
  implicitGrants: readonly string[] = FALLBACK_IMPLICIT_GRANTS,
): PermissionGroupOption[] =>
  Object.entries(groups)
    .map(([groupKey, groupValue]) => {
      const grants = collectGrants(groupValue)
        .map(({ path, value }) => ({
          id: `${groupKey}.${path}`,
          value,
          label: formatGrantLabel(value),
        }))
        .filter((grant) => !isImplicitGrant(grant.value, implicitGrants));

      return {
        groupKey,
        groupLabel: formatGroupLabel(groupKey),
        grants,
      };
    })
    .filter((group) => group.grants.length > 0);

export const grantsFromSelection = (
  selected: string[],
  delegatableGrants: string[],
  implicitGrants: readonly string[] = FALLBACK_IMPLICIT_GRANTS,
): string[] => {
  const allowed = new Set(delegatableGrants);
  return [
    ...new Set(
      selected.filter(
        (grant) => allowed.has(grant) && !isImplicitGrant(grant, implicitGrants),
      ),
    ),
  ];
};

export const resolvePanelHeaderConfig = (
  base: PanelHeaderConfig,
  perms: string[],
  resource: string,
  registry?: PermissionsRegistryPayload | null,
): PanelHeaderConfig => ({
  ...base,
  showAddBtn: Boolean(
    base.showAddBtn && canCrud(perms, resource, "create", registry),
  ),
  showExportBtn: Boolean(
    base.showExportBtn && canExport(perms, resource, registry),
  ),
});
