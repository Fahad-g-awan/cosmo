"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook for URL state synchronization.
 * Uses Next.js App Router's useSearchParams for reading and router.replace for updating.
 */
export const useUrlState = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Get a single value from URL params
   */
  const getValue = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  /**
   * Get and parse a JSON value from URL params
   */
  const getParsedValue = useCallback(
    <T>(key: string): T | null => {
      const value = searchParams.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    },
    [searchParams]
  );

  /**
   * Update URL with new params (replaces current URL without navigation)
   */
  const updateUrl = useCallback(
    (params: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      const queryString = newParams.toString();
      if (queryString === searchParams.toString()) return;

      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(newUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  /**
   * Clear all URL params
   */
  const clearUrl = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    getValue,
    getParsedValue,
    updateUrl,
    clearUrl,
    searchParams,
  };
};

export type UseUrlStateReturn = ReturnType<typeof useUrlState>;
