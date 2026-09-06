"use client";

import { useMemo } from "react";

import type { PermissionsRegistryPayload } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import { usePlatformNavigation } from "@app/context/PlatformNavigationContext";
import {
  FALLBACK_ROLE_IMPLICIT_GRANTS,
  getImplicitGrantsForRole,
} from "@app/lib/permissions";

export const usePermissions = () => {
  const { permissions } = usePlatformNavigation();
  const { sessionUser } = useAuth();

  const registry = useMemo(
    (): PermissionsRegistryPayload | null => permissions,
    [permissions],
  );

  const implicitGrants = useMemo(
    () =>
      registry?.implicitGrants ?? ["platform:navigation", "platform:constants"],
    [registry?.implicitGrants],
  );

  const roleImplicitGrants = useMemo(
    () => registry?.roleImplicitGrants ?? {},
    [registry?.roleImplicitGrants],
  );

  const role = sessionUser?.role ?? null;

  const perms = useMemo(() => {
    const held = sessionUser?.perms ?? [];
    const roleImplicits = getImplicitGrantsForRole(
      role,
      implicitGrants,
      Object.keys(roleImplicitGrants).length
        ? roleImplicitGrants
        : FALLBACK_ROLE_IMPLICIT_GRANTS,
    );
    return [...new Set([...held, ...roleImplicits])];
  }, [sessionUser?.perms, role, implicitGrants, roleImplicitGrants]);

  return {
    perms,
    registry,
    implicitGrants,
    roleImplicitGrants,
    role,
  };
};
