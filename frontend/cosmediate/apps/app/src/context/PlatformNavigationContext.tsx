"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  PlatformNavigation,
  PermissionsRegistryPayload,
} from "@cosmediate/api";
import { getPlatformNavigationApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

const NAV_FETCH_MAX_RETRIES = 2;
const NAV_FETCH_RETRY_DELAY_MS = 500;

interface PlatformNavigationContextValue {
  navigation: PlatformNavigation | null;
  permissions: PermissionsRegistryPayload | null;
  isLoading: boolean;
  error: string | null;
  hasNavError: boolean;
  refetch: () => Promise<void>;
}

const PlatformNavigationContext = createContext<
  PlatformNavigationContextValue | undefined
>(undefined);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const PlatformNavigationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [navigation, setNavigation] = useState<PlatformNavigation | null>(null);
  const [permissions, setPermissions] =
    useState<PermissionsRegistryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { session, isSessionLoading } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const fetchNavigation = useCallback(async () => {
    if (!accessToken) {
      setNavigation(null);
      setPermissions(null);
      setError(null);
      setIsLoading(isSessionLoading);
      return;
    }

    setIsLoading(true);
    setError(null);

    let lastError: string | null = null;

    for (let attempt = 0; attempt <= NAV_FETCH_MAX_RETRIES; attempt += 1) {
      try {
        const response = await getPlatformNavigationApi(accessToken);

        if (response.success && response.navigation) {
          setNavigation(response.navigation);
          setPermissions(response.permissions ?? null);
          setError(null);
          setIsLoading(false);
          return;
        }

        lastError = "Failed to load platform navigation";
      } catch (err) {
        console.error("Failed to load platform navigation:", err);
        lastError = "Failed to load platform navigation";
      }

      if (attempt < NAV_FETCH_MAX_RETRIES) {
        await delay(NAV_FETCH_RETRY_DELAY_MS * (attempt + 1));
      }
    }

    setNavigation(null);
    setPermissions(null);
    setError(lastError);
    setIsLoading(false);
  }, [accessToken, isSessionLoading]);

  useEffect(() => {
    fetchNavigation();
  }, [fetchNavigation]);

  const value = useMemo(
    () => ({
      navigation,
      permissions,
      isLoading,
      error,
      hasNavError: Boolean(error && !isLoading),
      refetch: fetchNavigation,
    }),
    [error, fetchNavigation, isLoading, navigation, permissions],
  );

  return (
    <PlatformNavigationContext.Provider value={value}>
      {children}
    </PlatformNavigationContext.Provider>
  );
};

export const usePlatformNavigation = (): PlatformNavigationContextValue => {
  const context = useContext(PlatformNavigationContext);

  if (!context) {
    throw new Error(
      "usePlatformNavigation must be used within a PlatformNavigationProvider",
    );
  }

  return context;
};
