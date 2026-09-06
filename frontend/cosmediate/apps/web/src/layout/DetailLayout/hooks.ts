"use client";

import { useState, useCallback, useEffect, startTransition } from "react";
import {
  useParams,
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import { useTranslations } from "@cosmediate/i18n/client";
import { Toaster } from "@cosmediate/ui";
import type { ApiSource } from "./types";

export interface UseDetailDataOptions<T> {
  fetchFn: (params: {
    id: string;
    from: string;
  }) => Promise<{ success: boolean; item?: T }>;
  defaultTab: string;
  entityName: string;
  initialEntity?: T | null;
}

export interface UseDetailDataReturn<T> {
  entity: T | null;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiSource: ApiSource;
  entityId: string | null;
}

function resolveUrlTab(
  urlTab: string | null,
  defaultTab: string,
): string {
  return urlTab || defaultTab;
}

function urlMatchesTab(
  urlTab: string | null,
  tab: string,
  defaultTab: string,
): boolean {
  if (tab === defaultTab) {
    return !urlTab;
  }
  return urlTab === tab;
}

/**
 * Custom hook for detail pages that handles:
 * - Entity fetching via API
 * - URL-based tab state management (?tab=xxx)
 * - Loading states
 * - Error handling
 */
export const useDetailData = <T extends { id: string }>({
  fetchFn,
  defaultTab,
  entityName,
  initialEntity,
}: UseDetailDataOptions<T>): UseDetailDataReturn<T> => {
  const common = useTranslations("common");
  const [entity, setEntity] = useState<T | null>(initialEntity ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialEntity);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { slug } = useParams();
  const searchParams = useSearchParams();

  const urlTab = searchParams.get("tab");
  const urlResolvedTab = resolveUrlTab(urlTab, defaultTab);
  const activeTab = pendingTab ?? urlResolvedTab;

  // Get API source from URL
  const apiSource = (searchParams.get("from") || "listing") as ApiSource;

  // Entity ID from URL
  const entityId = slug ? (slug as string) : null;

  // Drop optimistic tab once the URL reflects the selection.
  useEffect(() => {
    if (
      pendingTab !== null &&
      urlMatchesTab(urlTab, pendingTab, defaultTab)
    ) {
      setPendingTab(null);
    }
  }, [urlTab, pendingTab, defaultTab]);

  // Set active tab — update UI immediately, then sync URL.
  const setActiveTab = useCallback(
    (tab: string) => {
      setPendingTab(tab);

      const params = new URLSearchParams(searchParams.toString());
      if (tab === defaultTab) {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [searchParams, pathname, router, defaultTab],
  );

  // Fetch entity data
  const fetchEntity = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        const response = await fetchFn({ id, from: apiSource });

        if (response.success && response.item) {
          setEntity(response.item);
        } else {
          setEntity(null);
        }
      } catch (error) {
        console.error(`Error fetching ${entityName}:`, error);
        Toaster(common.pleaseTryAgainLater, "error");
        setEntity(null);
      } finally {
        setIsLoading(false);
      }
    },
    [apiSource, fetchFn, entityName, common.pleaseTryAgainLater],
  );

  // Fetch on mount and when ID changes
  useEffect(() => {
    if (!entityId) {
      return;
    }

    if (initialEntity?.id === entityId) {
      setEntity(initialEntity);
      setIsLoading(false);
      return;
    }

    fetchEntity(entityId);
  }, [entityId, fetchEntity, initialEntity]);

  return {
    entity,
    isLoading,
    activeTab,
    setActiveTab,
    apiSource,
    entityId,
  };
};
