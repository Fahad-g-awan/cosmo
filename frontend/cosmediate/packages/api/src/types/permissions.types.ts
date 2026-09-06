export type GrantCatalogGroup = Record<string, unknown>;

export interface SuperAccessMeta {
  grant: string;
  canGrant: boolean;
}

export interface PermissionsCatalog {
  groups: Record<string, GrantCatalogGroup>;
  grants: string[];
  superAccess: SuperAccessMeta;
}

export interface PermissionsRegistryPayload {
  registry: Record<string, string[]>;
  labels: Record<string, string>;
  implicitGrants: string[];
  /** Role → grants always held / hidden from assignment UI (e.g. patient CRUD for managers). */
  roleImplicitGrants?: Record<string, string[]>;
  superAccessGrant: string;
}

export interface GetPermissionsCatalogResponse {
  success: boolean;
  catalog: PermissionsCatalog;
}

export interface GetPlatformConstantsResponse {
  success: boolean;
  constants: Record<string, unknown>;
}

export interface PlatformNavigationItem {
  key: string;
  label: string;
  path?: string;
  parent?: string;
  requiredAny: string[];
  /** When set, only these roles may see the item (still requires matching perms). */
  roles?: string[];
}

export interface PlatformNavigation {
  admin: PlatformNavigationItem[];
  clinic: PlatformNavigationItem[];
  patient: PlatformNavigationItem[];
}

export interface GetPlatformNavigationResponse {
  success: boolean;
  navigation: PlatformNavigation;
  permissions?: PermissionsRegistryPayload;
}
