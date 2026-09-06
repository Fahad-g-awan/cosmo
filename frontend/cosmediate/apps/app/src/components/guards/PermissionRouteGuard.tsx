"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@cosmediate/auth";

import { usePlatformNavigation } from "@app/context/PlatformNavigationContext";
import { usePermissions } from "@app/hooks/usePermissions";
import { surfaceForRole, surfaceForTenant } from "@app/lib/platformNavigation";
import {
  canAccessPath,
  getFirstAllowedPath,
} from "@app/lib/routing/pathAccess";
import {
  canAccessRoute,
  getDefaultRouteForRole,
} from "@app/lib/routing/roleRouting";

interface PermissionRouteGuardProps {
  children: React.ReactNode;
  tenant?: "admin" | "clinic" | "specialist";
}

export const PermissionRouteGuard = ({
  children,
  tenant,
}: PermissionRouteGuardProps) => {
  const {
    navigation,
    isLoading: isNavigationLoading,
    hasNavError,
  } = usePlatformNavigation();
  const { userRole, isSessionLoading } = useAuth();
  const { perms } = usePermissions();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isSessionLoading || isNavigationLoading || hasNavError) return;
    if (!perms.length) return;

    const surface = tenant
      ? surfaceForTenant(tenant)
      : surfaceForRole(userRole);

    if (!surface) return;

    if (userRole && !canAccessRoute(userRole, pathname)) {
      const roleFallback = getDefaultRouteForRole(userRole);
      if (roleFallback && roleFallback !== pathname) {
        router.replace(roleFallback);
      }
      return;
    }

    if (canAccessPath(perms, pathname, navigation, surface, userRole)) {
      return;
    }

    const fallback =
      getFirstAllowedPath(navigation, surface, perms, userRole) ??
      getDefaultRouteForRole(userRole ?? undefined);

    if (fallback && fallback !== pathname) {
      router.replace(fallback);
    }
  }, [
    hasNavError,
    isNavigationLoading,
    isSessionLoading,
    navigation,
    pathname,
    perms,
    router,
    tenant,
    userRole,
  ]);

  return <>{children}</>;
};
