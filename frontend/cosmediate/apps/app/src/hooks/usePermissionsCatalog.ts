"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getPermissionsCatalogApi } from "@cosmediate/api";
import type { PermissionsCatalog } from "@cosmediate/api";
import type { UserRole } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { userCanGrantPermissions } from "@app/lib/permissions";

interface UsePermissionsCatalogOptions {
  enabled?: boolean;
  targetRole: UserRole;
}

export const usePermissionsCatalog = ({
  enabled = true,
  targetRole,
}: UsePermissionsCatalogOptions) => {
  const [catalog, setCatalog] = useState<PermissionsCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { session, sessionUser } = useAuth();

  const canGrant = useMemo(
    () => userCanGrantPermissions(sessionUser?.perms ?? []),
    [sessionUser?.perms],
  );

  const fetchCatalog = useCallback(async () => {
    if (!session?.tokens?.accessToken || !canGrant || !targetRole) {
      setCatalog(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getPermissionsCatalogApi(
        session.tokens.accessToken,
        targetRole,
      );

      if (response.success && response.catalog) {
        setCatalog(response.catalog);
      } else {
        setCatalog(null);
        setError("Failed to load permissions catalog");
      }
    } catch (err) {
      console.error("Failed to load permissions catalog:", err);
      setCatalog(null);
      setError("Failed to load permissions catalog");
    } finally {
      setIsLoading(false);
    }
  }, [canGrant, session?.tokens?.accessToken, targetRole]);

  useEffect(() => {
    if (!enabled || !canGrant || !targetRole) {
      setCatalog(null);
      return;
    }
    fetchCatalog();
  }, [canGrant, enabled, fetchCatalog, targetRole]);

  return {
    catalog,
    canGrant,
    isLoading,
    error,
    refetch: fetchCatalog,
  };
};
