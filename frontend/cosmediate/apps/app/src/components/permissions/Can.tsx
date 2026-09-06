"use client";

import type { ReactNode } from "react";

import { usePermissions } from "@app/hooks/usePermissions";
import { hasPermission } from "@app/lib/permissions";

interface CanProps {
  permission?: string;
  permissions?: string[];
  mode?: "any" | "all";
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({
  permission,
  permissions,
  mode = "any",
  children,
  fallback = null,
}: CanProps) => {
  const { perms } = usePermissions();

  const required = permissions ?? (permission ? [permission] : []);

  if (!hasPermission(perms, required, mode)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
