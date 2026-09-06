import { UserRole } from "@cosmediate/type-utils";
import { ROLE_ROUTES } from "@app/config/routes";

export function getDefaultRouteForRole(role: UserRole | undefined): string {
  if (!role) return "/appointments";
  return ROLE_ROUTES[role]?.defaultRoute || "/appointments";
}

export function canAccessRoute(
  role: string | undefined,
  route: string,
): boolean {
  if (!role) return false;

  const normalizedRole = role.toUpperCase() as UserRole;
  const config = ROLE_ROUTES[normalizedRole];

  if (config && config.routes.some((r) => route.startsWith(r))) {
    return true;
  }

  return false;
}

export function getAllProtectedRoutes(): string[] {
  const allRoutes = new Set<string>();

  Object.values(ROLE_ROUTES).forEach((config) => {
    config.routes.forEach((route) => allRoutes.add(route));
  });

  return Array.from(allRoutes);
}
