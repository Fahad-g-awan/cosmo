import type {
  PlatformNavigation,
  PlatformNavigationItem,
} from "@cosmediate/api";
import type { UserRole } from "@cosmediate/type-utils";

import type { SectionNavItem } from "@app/config/sectionNav.config";
import { getNavigationIcon } from "@app/config/navigationIcons.config";
import type { RouteConfig } from "@app/types/shared";

import { userHasAnyRequiredPerm } from "./permissions";

export { userHasAnyRequiredPerm };

export type NavigationSurface = keyof PlatformNavigation;

export const surfaceForRole = (
  role: UserRole | null | undefined,
): NavigationSurface | null => {
  switch (role) {
    case "ADMIN":
      return "admin";
    case "MANAGER":
    case "SPECIALIST":
      return "clinic";
    case "PATIENT":
      return "patient";
    default:
      return null;
  }
};

export const surfaceForTenant = (
  tenant: "admin" | "clinic" | "specialist",
): NavigationSurface => (tenant === "admin" ? "admin" : "clinic");

/** Map layout tenant to the identity role used for role-scoped nav items. */
export const roleForTenant = (
  tenant: "admin" | "clinic" | "specialist",
): UserRole => {
  switch (tenant) {
    case "admin":
      return "ADMIN";
    case "specialist":
      return "SPECIALIST";
    default:
      return "MANAGER";
  }
};

/**
 * Whether the item is visible for this role.
 * Items without `roles` are visible to every role on the surface.
 */
export const userHasRequiredRole = (
  userRole: UserRole | string | null | undefined,
  itemRoles: string[] | undefined,
): boolean => {
  if (!itemRoles?.length) return true;
  if (!userRole) return false;
  return itemRoles.includes(String(userRole).toUpperCase());
};

export const filterNavItemsByPerms = (
  items: PlatformNavigationItem[],
  userPerms: string[],
  userRole?: UserRole | string | null,
): PlatformNavigationItem[] =>
  items.filter(
    (item) =>
      userHasRequiredRole(userRole, item.roles) &&
      userHasAnyRequiredPerm(userPerms, item.requiredAny),
  );

export const getRootNavItems = (
  items: PlatformNavigationItem[],
): PlatformNavigationItem[] => items.filter((item) => !item.parent);

/**
 * Match a pathname against a main-tab path (exact, nested, or same first segment).
 *
 * @param pathname - The pathname to match against.
 * @param routePath - The path to match against.
 * @returns True if the pathname matches the route path, false otherwise.
 */
export const matchesNavRootPath = (
  pathname: string,
  routePath: string,
): boolean => {
  const normalizedPathname = pathname.replace(/\/$/, "");
  const normalizedRoutePath = routePath.replace(/\/$/, "");
  const firstSegment = normalizedRoutePath.split("/")[1] ?? "";
  const firstSegmentPath = `/${firstSegment}`;

  return (
    normalizedPathname === normalizedRoutePath ||
    normalizedPathname.startsWith(`${normalizedRoutePath}/`) ||
    normalizedPathname.startsWith(`${firstSegmentPath}/`) ||
    normalizedPathname === firstSegmentPath
  );
};

export const toSidebarRoutes = (
  items: PlatformNavigationItem[],
): RouteConfig[] =>
  getRootNavItems(items).flatMap((item) => {
    if (!item.path) return [];
    return [
      {
        label: item.label,
        path: item.path,
        icon: getNavigationIcon(item.key),
      },
    ];
  });

export const resolveNavRootFromPath = (
  pathname: string,
  items: PlatformNavigationItem[],
): PlatformNavigationItem | undefined =>
  getRootNavItems(items)
    .filter((root) => root.path && matchesNavRootPath(pathname, root.path))
    .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0];

const buildSectionNavBranch = (
  items: PlatformNavigationItem[],
  parentKey: string,
  sectionTitle: string,
): SectionNavItem[] =>
  items
    .filter((item) => item.parent === parentKey)
    .map((item) => {
      const children = buildSectionNavBranch(items, item.key, sectionTitle);
      const navItem: SectionNavItem = {
        key: item.key,
        sectionTitle,
        label: item.label,
        path: item.path,
        icon: getNavigationIcon(item.key),
      };
      if (children.length) {
        navItem.children = children;
      }
      return navItem;
    });

export const buildSectionNavItems = (
  items: PlatformNavigationItem[],
  rootKey: string,
  sectionTitle: string,
): SectionNavItem[] => {
  const branches = buildSectionNavBranch(items, rootKey, sectionTitle);
  if (!branches.length) {
    // Sidebar roots without sub-nav (analytics, inbox, …) — no section panel.
    return [];
  }

  const root = items.find((item) => item.key === rootKey);
  if (!root) return branches;

  return [
    {
      key: root.key,
      sectionTitle,
      label: root.label,
      icon: getNavigationIcon(root.key),
      children: branches,
    },
  ];
};

const collectPlatformPaths = (items: PlatformNavigationItem[]): Set<string> => {
  const paths = new Set<string>();
  for (const item of items) {
    if (item.path) paths.add(item.path);
  }
  return paths;
};

/** Keep sectionNav.config hierarchy; drop leaves not present in perm-filtered platform nav. */
export const filterSectionNavByPlatform = (
  items: SectionNavItem[],
  platformItems: PlatformNavigationItem[],
): SectionNavItem[] => {
  const visiblePaths = collectPlatformPaths(platformItems);

  const walk = (nodes: SectionNavItem[]): SectionNavItem[] => {
    const result: SectionNavItem[] = [];

    for (const node of nodes) {
      const children = node.children ? walk(node.children) : undefined;
      const hasVisibleChildren = Boolean(children?.length);
      const pathVisible = node.path ? visiblePaths.has(node.path) : false;

      if (hasVisibleChildren) {
        result.push({ ...node, children });
        continue;
      }

      if (pathVisible) {
        result.push({
          key: node.key,
          sectionTitle: node.sectionTitle,
          label: node.label,
          path: node.path,
          icon: node.icon,
        });
      }
    }

    return result;
  };

  return walk(items);
};

export const getSurfaceNavItems = (
  navigation: PlatformNavigation | null,
  surface: NavigationSurface | null,
  userPerms: string[],
  userRole?: UserRole | string | null,
): PlatformNavigationItem[] => {
  if (!navigation || !surface) return [];
  return filterNavItemsByPerms(navigation[surface], userPerms, userRole);
};
