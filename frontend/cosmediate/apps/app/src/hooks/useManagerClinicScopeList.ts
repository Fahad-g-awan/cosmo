"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getManagementClinicsApi } from "@cosmediate/api";
import type { Clinic } from "@cosmediate/type-utils/clinic";
import { useAuth } from "@cosmediate/auth";

import { PAGINATED_ASYNC_SCROLL_THRESHOLD_PX } from "@app/modules/PaginatedAsyncSelect";
import { PAGINATED_ASYNC_SWITCHER_PAGE_SIZE } from "@app/modules/PaginatedAsyncSelect";

const SEARCH_DEBOUNCE_MS = 300;

export interface UseManagerClinicScopeListOptions {
  /** Fetch only after the switcher panel opens. */
  open?: boolean;
  enabled?: boolean;
}

export interface UseManagerClinicScopeListResult {
  items: Clinic[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  search: string;
  setSearch: (value: string) => void;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  reload: () => void;
}

export function useManagerClinicScopeList({
  open = false,
  enabled = true,
}: UseManagerClinicScopeListOptions = {}): UseManagerClinicScopeListResult {
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [items, setItems] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const { session, sessionUser } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const scopeClinicIds = useMemo(
    () => sessionUser?.scope?.clinicIds ?? [],
    [sessionUser?.scope?.clinicIds],
  );

  const loadingMoreRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);

  const loadFirst = useCallback(async () => {
    if (!enabled || !accessToken || !scopeClinicIds.length) {
      setItems([]);
      setNextToken(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await getManagementClinicsApi(
        {
          filters: { clinicIds: scopeClinicIds },
          pagination: { limit: PAGINATED_ASYNC_SWITCHER_PAGE_SIZE },
          ...(debouncedSearch ? { search: { query: debouncedSearch } } : {}),
        },
        accessToken,
      );

      if (requestId !== requestIdRef.current) return;

      setItems(response.items ?? []);
      setNextToken(response.nextToken ?? null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load clinics");
      setItems([]);
      setNextToken(null);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [accessToken, debouncedSearch, enabled, scopeClinicIds]);

  const loadMore = useCallback(async () => {
    if (
      !enabled ||
      !accessToken ||
      !nextToken ||
      loadingMoreRef.current ||
      loading
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    const requestId = requestIdRef.current;

    try {
      const response = await getManagementClinicsApi(
        {
          filters: { clinicIds: scopeClinicIds },
          pagination: {
            limit: PAGINATED_ASYNC_SWITCHER_PAGE_SIZE,
            nextToken,
          },
          ...(debouncedSearch ? { search: { query: debouncedSearch } } : {}),
        },
        accessToken,
      );

      if (requestId !== requestIdRef.current) return;

      setItems((prev) => {
        const seen = new Set(prev.map((clinic) => clinic.id));
        const appended = (response.items ?? []).filter(
          (clinic) => !seen.has(clinic.id),
        );
        return [...prev, ...appended];
      });
      setNextToken(response.nextToken ?? null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(
        err instanceof Error ? err.message : "Failed to load more clinics",
      );
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [
    accessToken,
    debouncedSearch,
    enabled,
    loading,
    nextToken,
    scopeClinicIds,
  ]);

  const reload = useCallback(() => {
    requestIdRef.current += 1;
    setItems([]);
    setNextToken(null);
    void loadFirst();
  }, [loadFirst]);

  useEffect(() => {
    if (!enabled || !open) return;
    void loadFirst();
  }, [debouncedSearch, enabled, loadFirst, open, scopeClinicIds]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const element = event.currentTarget;
      const remaining =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining <= PAGINATED_ASYNC_SCROLL_THRESHOLD_PX) {
        void loadMore();
      }
    },
    [loadMore],
  );

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore: Boolean(nextToken),
    search,
    setSearch,
    handleScroll,
    reload,
  };
}
