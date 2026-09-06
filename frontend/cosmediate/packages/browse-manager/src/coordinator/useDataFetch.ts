"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { isDistanceFilterActive } from "../filters/filter-helpers";
import { usePreferencesOptional } from "../preferences/context";
import { usePaginationOptional } from "../pagination/context";
import { useFiltersOptional } from "../filters/context";
import type {
  FetchParams,
  UseDataFetchOptions,
  UseDataFetchReturn,
} from "./types";
import { useAuth } from "@cosmediate/auth";

/**
 * Hook that coordinates Filters, Preferences, and Pagination managers for data fetching.
 * Works with any combination of managers - uses what's available.
 */
export const useDataFetch = <T = unknown>({
  fetchData,
  analytics,
  autoFetch = true,
  requireAuth = true,
}: UseDataFetchOptions<T>): UseDataFetchReturn => {
  const filters = useFiltersOptional();
  const preferences = usePreferencesOptional();
  const pagination = usePaginationOptional();

  const { session, isSessionLoading } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const activeFilterValues = useMemo(() => {
    return filters?.getActiveFilterValues?.() ?? {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, filters?.activeFilters, filters?.config]);

  const needsGeoLocation =
    Boolean(filters?.config?.enableGeolocation) &&
    isDistanceFilterActive(activeFilterValues);

  // Ready when browse managers are initialized; auth optional for public pages
  const isReady =
    (requireAuth ? !isSessionLoading : true) &&
    (requireAuth ? !!accessToken : true) &&
    (filters?.isInitialized || !filters) &&
    (preferences?.isInitialized || !preferences) &&
    pagination !== null &&
    (!needsGeoLocation || filters?.userLocation !== null);

  // Get values with defaults
  const sortBy = preferences?.sortBy || "";
  const sortOrder = preferences?.sortOrder || "asc";
  const itemsPerPage = preferences?.itemsPerPage || 12;
  const searchQuery = filters?.searchQuery || "";

  // const activeFilters = useMemo(
  //   () => filters?.activeFilters || {},
  //   [filters?.activeFilters]
  // );
  // const searchQuery = useMemo(
  //   () => filters?.searchQuery || "",
  //   [filters?.searchQuery]
  // );

  // Build fetch params
  const buildParams = useCallback(
    (nextToken?: string): FetchParams => {
      const filterValues = { ...activeFilterValues };

      if (
        isDistanceFilterActive(filterValues) &&
        filters?.config?.enableGeolocation &&
        filters?.userLocation
      ) {
        filterValues.userLocation = filters.userLocation;
      }

      return {
        filters: Object.keys(filterValues).length ? filterValues : undefined,
        search: {
          query: searchQuery,
        },
        sort: {
          by: sortBy,
          order: sortOrder,
        },
        pagination: {
          page: pagination ? pagination.currentIndex + 1 : 1,
          limit: itemsPerPage,
          nextToken,
        },
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activeFilterValues,
      filters?.userLocation,
      searchQuery,
      sortBy,
      sortOrder,
      itemsPerPage,
      pagination,
    ],
  );

  // Initial fetch
  const runInitial = useCallback(async () => {
    if (!pagination) return;

    pagination.setLoading(true);

    try {
      const params = buildParams();
      const response = await fetchData(params, session?.tokens?.accessToken);

      pagination.reset({
        items: response.items,
        nextToken: response.nextToken,
        total: response.total,
        paginationMode: response.paginationMode,
      });

      // Track search if query exists
      if (searchQuery && analytics) {
        analytics.trackEvent("search_performed", {
          query: searchQuery,
          results_count: response.total,
        });
      }
    } catch (error) {
      console.error("[useDataFetch] Initial fetch failed:", error);
      pagination.reset({ items: [], total: 0 });
    } finally {
      pagination.setLoading(false);
    }
  }, [
    pagination,
    buildParams,
    fetchData,
    searchQuery,
    analytics,
    session?.tokens?.accessToken,
  ]);

  // Fetch next page
  const runNext = useCallback(async () => {
    if (!pagination) return;

    // If next page is cached, just navigate
    if (pagination.hasNextPageCached()) {
      pagination.goNext();
      analytics?.trackEvent("page_next", {
        page_index: pagination.currentIndex + 1,
        cached: true,
      });
      return;
    }

    // Need to fetch
    const nextCursor = pagination.getNextCursor();
    if (!nextCursor) return;

    pagination.setLoading(true);

    try {
      const params = buildParams(nextCursor);
      const response = await fetchData(params);

      pagination.appendPage({
        items: response.items,
        nextToken: response.nextToken,
        total: response.total,
        paginationMode: response.paginationMode,
      });

      analytics?.trackEvent("page_next", {
        page_index: pagination.currentIndex + 1,
        cached: false,
      });
    } catch (error) {
      console.error("[useDataFetch] Next page fetch failed:", error);
    } finally {
      pagination.setLoading(false);
    }
  }, [pagination, buildParams, fetchData, analytics]);

  // Go to previous page
  const goPrevious = useCallback(() => {
    if (!pagination) return;
    pagination.goPrevious();
    analytics?.trackEvent("page_previous", {
      page_index: pagination.currentIndex - 1,
    });
  }, [pagination, analytics]);

  // Refetch
  const refetch = useCallback(async () => {
    await runInitial();
  }, [runInitial]);

  useEffect(() => {
    if (!pagination?.setRefetchFn) return;

    pagination.setRefetchFn(refetch);

    return () => {
      pagination.setRefetchFn(async () => {});
    };
  }, [pagination, refetch]);

  // // Auto-fetch when state changes
  // const activeFiltersStr = JSON.stringify(activeFilters);
  // const prevDepsRef = useRef<string>("");

  // useEffect(() => {
  //   if (!autoFetch || !isReady || !pagination) return;

  //   // Create a stable key from all dependencies
  //   const depsKey = `${activeFiltersStr}|${searchQuery}|${sortBy}|${sortOrder}|${itemsPerPage}`;

  //   // Skip if deps haven't actually changed (prevents double-fetch on init)
  //   if (depsKey === prevDepsRef.current && isInitialFetchDone.current) {
  //     return;
  //   }

  //   // Skip first fetch if pagination already has data
  //   if (!isInitialFetchDone.current) {
  //     isInitialFetchDone.current = true;
  //     prevDepsRef.current = depsKey;
  //     if (!pagination.isInitialized) {
  //       runInitial();
  //     }
  //     return;
  //   }

  //   // Only refetch if actual filter/sort/pagination values changed
  //   if (depsKey !== prevDepsRef.current) {
  //     prevDepsRef.current = depsKey;
  //     runInitial();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   autoFetch,
  //   isReady,
  //   activeFiltersStr,
  //   searchQuery,
  //   sortBy,
  //   sortOrder,
  //   itemsPerPage,
  // ]);

  // const filtersVersion = filters?.version ?? 0;
  // const prefsVersion = preferences?.version ?? 0;

  // useEffect(() => {
  //   console.log("[useDataFetch] effect fired", {
  //     filtersVersion,
  //     prefsVersion,
  //   });

  //   if (!autoFetch || !isReady || !pagination) return;
  //   runInitial();
  // }, [
  //   autoFetch,
  //   isReady,
  //   pagination,
  //   filtersVersion,
  //   prefsVersion,
  //   runInitial,
  // ]);

  const runInitialRef = useRef(runInitial);

  useEffect(() => {
    runInitialRef.current = runInitial;
  }, [runInitial, session]);

  const lastFetchKeyRef = useRef<string | null>(null);
  const didInitRef = useRef(false);

  const fetchKey = useMemo(() => {
    return JSON.stringify({
      scope: pagination?.scope,
      sortBy: preferences?.sortBy,
      sortOrder: preferences?.sortOrder,
      itemsPerPage: preferences?.itemsPerPage,

      activeFilters: filters?.activeFilters,
      searchQuery: filters?.searchQuery,
      accessToken: requireAuth ? session?.tokens?.accessToken : undefined,
    });
  }, [
    filters?.activeFilters,
    filters?.searchQuery,

    pagination?.scope,

    preferences?.sortBy,
    preferences?.sortOrder,
    preferences?.itemsPerPage,

    requireAuth,
    session?.tokens?.accessToken,
  ]);

  useEffect(() => {
    if (!autoFetch || !isReady) return;

    // First ever fetch
    if (!didInitRef.current) {
      didInitRef.current = true;
      lastFetchKeyRef.current = fetchKey;
      runInitialRef.current();
      return;
    }

    // Only refetch if semantic inputs changed
    if (fetchKey !== lastFetchKeyRef.current) {
      lastFetchKeyRef.current = fetchKey;
      runInitialRef.current();
    }
  }, [autoFetch, isReady, fetchKey]);

  return {
    runInitial,
    runNext,
    goPrevious,
    refetch,
    isLoading: pagination?.isLoading || false,
    isReady,
  };
};
