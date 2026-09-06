import type {
  PlatformNavigation,
  PlatformNavigationItem,
} from "@cosmediate/api";
import type { UserRole } from "@cosmediate/type-utils";

import {
  getSurfaceNavItems,
  userHasAnyRequiredPerm,
  userHasRequiredRole,
  type NavigationSurface,
} from "@app/lib/platformNavigation";

export const findNavItemForPath = (
  pathname: string,
  items: PlatformNavigationItem[],
): PlatformNavigationItem | undefined => {
  const withPath = items.filter((item) => item.path);

  return withPath
    .filter(
      (item) =>
        item.path &&
        (pathname === item.path || pathname.startsWith(`${item.path}/`)),
    )
    .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0];
};

const SETTINGS_GUARDED_PREFIXES = [
  "/settings/treatments-management/",
  "/settings/clinic-setup/",
  "/settings/account/",
];

const isSettingsGuardedPath = (pathname: string) =>
  SETTINGS_GUARDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const canAccessPath = (
  perms: string[],
  pathname: string,
  navigation: PlatformNavigation | null,
  surface: NavigationSurface | null,
  userRole?: UserRole | string | null,
): boolean => {
  if (!navigation || !surface) return true;

  const surfaceItems = getSurfaceNavItems(
    navigation,
    surface,
    perms,
    userRole,
  );
  const allSurfaceItems = navigation[surface] ?? [];
  const matched =
    findNavItemForPath(pathname, surfaceItems) ??
    findNavItemForPath(pathname, allSurfaceItems);

  if (!matched) {
    return !isSettingsGuardedPath(pathname);
  }

  return (
    userHasRequiredRole(userRole, matched.roles) &&
    userHasAnyRequiredPerm(perms, matched.requiredAny)
  );
};

export const getFirstAllowedPath = (
  navigation: PlatformNavigation | null,
  surface: NavigationSurface | null,
  perms: string[],
  userRole?: UserRole | string | null,
): string | null => {
  if (!navigation || !surface) return null;

  const surfaceItems = getSurfaceNavItems(
    navigation,
    surface,
    perms,
    userRole,
  );
  const roots = surfaceItems.filter((item) => !item.parent && item.path);

  return roots[0]?.path ?? null;
};
