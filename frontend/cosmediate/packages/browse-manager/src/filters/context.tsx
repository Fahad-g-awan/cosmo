"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import type {
  FiltersConfig,
  FiltersContextType,
  ScopedFiltersState,
  UserLocation,
} from "./types";
import { useUrlState } from "../utils/url";
import {
  createFiltersMemoryManager,
  registerManager,
} from "../utils/scopeMemory";
import { getUserLocation } from "../utils/location";
import {
  areFilterRecordsEqual,
  DISTANCE_FILTER_ID,
  extractActiveFilterValues,
  getHeaderFilterIds,
  getSidebarFilterIds,
  hasActiveNonDefaultForFilters,
  hasPendingChangesForFilterIds,
  isSidebarFilter,
  valuesEqual,
  withDistanceReset,
} from "./filter-helpers";

// ============================================
// GLOBAL MEMORY STORE
// ============================================

const scopeMemory = createFiltersMemoryManager();
registerManager(scopeMemory);

// ============================================
// CONTEXT
// ============================================

const FiltersContext = createContext<FiltersContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface FiltersProviderProps {
  children: React.ReactNode;
}

export const FiltersProvider = ({ children }: FiltersProviderProps) => {
  const { updateUrl, getValue, getParsedValue } = useUrlState();

  // Config state
  const [config, setConfigState] = useState<FiltersConfig | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Previous scope ref
  const previousScopeRef = useRef<string | null>(null);

  // Search state (query only)
  const [searchQuery, setSearchQueryState] = useState("");
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");

  // Filter state
  const [activeFilters, setActiveFilters] = useState<
    Record<string, { value: unknown; isDirty: boolean }>
  >({});
  const [pendingFilters, setPendingFilters] = useState<
    Record<string, { value: unknown; isDirty: boolean }>
  >({});

  // UI state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Derived state
  const isSearchActive = Boolean(searchQuery);

  const isFiltersActive = config?.filters
    ? config.filters.some((f) => {
        const current = activeFilters[f.id]?.value;
        const defaultVal = f.defaultValue;
        return !valuesEqual(current, defaultVal);
      })
    : false;

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isRequestingUserLocation, setIsRequestingUserLocation] = useState(false);

  const hasUserLocationAccess = userLocation !== null;

  const sanitizeStateForGeolocation = useCallback(
    (state: ScopedFiltersState, cfg: FiltersConfig): ScopedFiltersState => {
      if (!cfg.enableGeolocation || userLocation) return state;

      return {
        ...state,
        activeFilters: withDistanceReset(state.activeFilters, cfg),
        pendingFilters: withDistanceReset(state.pendingFilters, cfg),
      };
    },
    [userLocation],
  );

  const requestUserLocation = useCallback(async (): Promise<boolean> => {
    setIsRequestingUserLocation(true);
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      return true;
    } catch {
      return false;
    } finally {
      setIsRequestingUserLocation(false);
    }
  }, []);

  const headerFilterIds = useMemo(() => getHeaderFilterIds(config), [config]);

  const sidebarFilterConfigs = useMemo(
    () => config?.filters?.filter(isSidebarFilter) ?? [],
    [config],
  );

  const sidebarFilterIds = useMemo(() => getSidebarFilterIds(config), [config]);

  const hasHeaderPendingChanges = useMemo(() => {
    const searchChanged = pendingSearchQuery !== searchQuery;
    const headerFiltersChanged = hasPendingChangesForFilterIds(
      pendingFilters,
      activeFilters,
      headerFilterIds,
    );
    return searchChanged || headerFiltersChanged;
  }, [
    pendingSearchQuery,
    searchQuery,
    pendingFilters,
    activeFilters,
    headerFilterIds,
  ]);

  const hasSidebarPendingChanges = useMemo(
    () =>
      hasPendingChangesForFilterIds(
        pendingFilters,
        activeFilters,
        sidebarFilterIds,
      ),
    [pendingFilters, activeFilters, sidebarFilterIds],
  );

  const hasSidebarActiveFilters = useMemo(
    () => hasActiveNonDefaultForFilters(activeFilters, sidebarFilterConfigs),
    [activeFilters, sidebarFilterConfigs],
  );

  // ============================================
  // STATE VALIDATION
  // ============================================

  const isValidState = useCallback(
    (state: ScopedFiltersState, cfg: FiltersConfig): boolean => {
      // Check required fields
      if (
        typeof state.searchQuery !== "string" ||
        typeof state.pendingSearchQuery !== "string" ||
        typeof state.activeFilters !== "object" ||
        typeof state.pendingFilters !== "object" ||
        state.activeFilters === null ||
        state.pendingFilters === null
      ) {
        return false;
      }

      // Check filter keys against config
      if (cfg.filters) {
        const validFilterIds = new Set(cfg.filters.map((f) => f.id));
        const stateFilterKeys = new Set([
          ...Object.keys(state.activeFilters),
          ...Object.keys(state.pendingFilters),
        ]);

        // All filter keys in state should exist in config
        for (const key of stateFilterKeys) {
          if (!validFilterIds.has(key)) {
            return false;
          }
        }
      }

      return true;
    },
    [],
  );

  const hasActiveFilters = useCallback(
    (filters: Record<string, unknown>, cfg: FiltersConfig): boolean => {
      return cfg.filters
        ? cfg.filters.some((f) => {
            const current = filters[f.id];
            const defaultVal = f.defaultValue;
            return !valuesEqual(current, defaultVal);
          })
        : false;
    },
    [],
  );

  // ============================================
  // STATE HELPERS
  // ============================================

  const getCurrentState = useCallback(
    (): ScopedFiltersState => ({
      searchQuery,
      pendingSearchQuery,
      activeFilters,
      pendingFilters,
    }),
    [searchQuery, pendingSearchQuery, activeFilters, pendingFilters],
  );

  const applyState = useCallback((state: ScopedFiltersState) => {
    setSearchQueryState(state.searchQuery);
    setPendingSearchQuery(state.pendingSearchQuery);
    setActiveFilters(state.activeFilters);
    setPendingFilters(state.pendingFilters);
  }, []);

  const getDefaultFilters = useCallback(
    (
      cfg: FiltersConfig,
    ): Record<string, { value: unknown; isDirty: boolean }> => {
      const defaults: Record<string, { value: unknown; isDirty: boolean }> = {};

      cfg.filters?.forEach((filter) => {
        defaults[filter.id] = {
          value: filter.defaultValue,
          isDirty: false,
        };
      });
      return defaults;
    },
    [],
  );

  const getInitialState = useCallback(
    (cfg: FiltersConfig): ScopedFiltersState => {
      const defaultFilters: Record<
        string,
        { value: unknown; isDirty: boolean }
      > = {};
      cfg.filters?.forEach((filter) => {
        defaultFilters[filter.id] = {
          value: filter.defaultValue,
          isDirty: false,
        };
      });
      return {
        searchQuery: "",
        pendingSearchQuery: "",
        activeFilters: defaultFilters,
        pendingFilters: defaultFilters,
      };
    },
    [],
  );

  /**
   * ====================================
   * Helper
   * ====================================
   */

  const pushFiltersToUrl = useCallback(
    (
      nextSearchQuery: string,
      nextActiveFilters: Record<string, { value: unknown; isDirty: boolean }>,
    ) => {
      if (!config || config.syncToUrl === false) return;

      const urlFilters: Record<string, unknown> = {};
      let hasNonDefault = false;

      config.filters?.forEach((filterConfig) => {
        const current = nextActiveFilters[filterConfig.id]?.value;
        const defaultVal = filterConfig.defaultValue;
        if (JSON.stringify(current) !== JSON.stringify(defaultVal)) {
          urlFilters[filterConfig.id] = current;
          hasNonDefault = true;
        }
      });

      updateUrl({
        query: nextSearchQuery || undefined,
        filters: hasNonDefault ? JSON.stringify(urlFilters) : undefined,
      });
    },
    [config, updateUrl],
  );

  // ============================================
  // SET CONFIG
  // ============================================

  const setConfig = useCallback(
    (newConfig: FiltersConfig) => {
      if (
        config &&
        config.scope === newConfig.scope &&
        JSON.stringify(config.filters) === JSON.stringify(newConfig.filters) &&
        config.syncToUrl === newConfig.syncToUrl
      ) {
        return;
      }

      const newScope = newConfig.scope;
      const oldScope = previousScopeRef.current;

      // Save current state if switching scopes (idempotent)
      if (oldScope && oldScope !== newScope) {
        const currentState = getCurrentState();
        // Only save if state is meaningful
        if (
          currentState.searchQuery ||
          hasActiveFilters(currentState.activeFilters, newConfig)
        ) {
          scopeMemory.set(oldScope, currentState);
        }
      }

      // Check for cached state (idempotent restore)
      const cachedState = scopeMemory.get(newScope);

      if (cachedState) {
        // Validate cached state before applying
        if (isValidState(cachedState, newConfig)) {
          applyState(sanitizeStateForGeolocation(cachedState, newConfig));
        } else {
          // Invalid cache, delete and use defaults
          scopeMemory.delete(newScope);
          applyState(
            sanitizeStateForGeolocation(getInitialState(newConfig), newConfig),
          );
        }
      } else if (newConfig.syncToUrl !== false) {
        // Load from URL
        const urlFilters = getParsedValue<Record<string, unknown>>("filters");
        const urlQuery = getValue("query") || "";

        const initialState = getInitialState(newConfig);

        if (urlFilters && typeof urlFilters === "object") {
          // Convert URL values to filter objects with isDirty: false
          Object.keys(urlFilters).forEach((key) => {
            if (urlFilters[key] !== undefined) {
              initialState.activeFilters[key] = {
                value: urlFilters[key],
                isDirty: true,
              };
              initialState.pendingFilters[key] = {
                value: urlFilters[key],
                isDirty: true,
              };
            }
          });
        }

        if (urlQuery) {
          initialState.searchQuery = urlQuery;
          initialState.pendingSearchQuery = urlQuery;
        }

        applyState(sanitizeStateForGeolocation(initialState, newConfig));
      } else {
        applyState(sanitizeStateForGeolocation(getInitialState(newConfig), newConfig));
      }

      setConfigState(newConfig);
      previousScopeRef.current = newScope;
      setIsInitialized(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      getParsedValue,
      getValue,
      getCurrentState,
      applyState,
      getInitialState,
      isValidState,
      hasActiveFilters,
      sanitizeStateForGeolocation,
    ],
  );

  // Update config options only (without resetting filter values)
  // const updateConfig = useCallback(
  //   (newConfig: FiltersConfig) => {
  //     // Only update if options actually changed (deep comparison)
  //     const currentOptions = config?.filters?.map((f) => ({
  //       id: f.id,
  //       options: "options" in f ? f.options : undefined,
  //     }));
  //     const newOptions = newConfig.filters?.map((f) => ({
  //       id: f.id,
  //       options: "options" in f ? f.options : undefined,
  //     }));

  //     if (JSON.stringify(currentOptions) !== JSON.stringify(newOptions)) {
  //       setConfigState(newConfig);
  //     }
  //   },
  //   [config]
  // );

  // ============================================
  // RESET
  // ============================================

  const reset = useCallback(() => {
    if (!config) return;
    const initial = getInitialState(config);
    applyState(initial);

    // Idempotent delete - only delete if exists
    if (config.scope && scopeMemory.has(config.scope)) {
      scopeMemory.delete(config.scope);
    }

    pushFiltersToUrl(initial.searchQuery, initial.activeFilters);
  }, [config, getInitialState, applyState, pushFiltersToUrl]);

  // ============================================
  // SEARCH ACTIONS
  // ============================================

  const setPendingSearchQueryAction = useCallback((query: string) => {
    setPendingSearchQuery(query);
  }, []);

  const applySearch = useCallback(() => {
    setSearchQueryState(pendingSearchQuery);
    pushFiltersToUrl(pendingSearchQuery, activeFilters);
  }, [pendingSearchQuery, activeFilters, pushFiltersToUrl]);

  const clearSearch = useCallback(() => {
    setPendingSearchQuery("");
    setSearchQueryState("");
    pushFiltersToUrl("", activeFilters);
  }, [activeFilters, pushFiltersToUrl]);

  const setSearchQuery = useCallback(
    (query: string) => {
      // setPendingSearchQuery(query);
      setSearchQueryState(query);
      pushFiltersToUrl(query, activeFilters);
    },
    [activeFilters, pushFiltersToUrl],
  );

  // ============================================
  // FILTER ACTIONS
  // ============================================

  const updatePendingFilter = useCallback((key: string, value: unknown) => {
    setPendingFilters((prev) => ({
      ...prev,
      [key]: {
        value,
        isDirty: true,
      },
    }));
  }, []);

  const applyHeaderFilters = useCallback(() => {
    if (!config) return;

    const nextActiveFilters = { ...activeFilters };
    for (const id of headerFilterIds) {
      const pending = pendingFilters[id];
      if (pending) {
        nextActiveFilters[id] = { value: pending.value, isDirty: false };
      }
    }

    setSearchQueryState(pendingSearchQuery);
    setActiveFilters(nextActiveFilters);
    pushFiltersToUrl(pendingSearchQuery, nextActiveFilters);
  }, [
    config,
    activeFilters,
    headerFilterIds,
    pendingFilters,
    pendingSearchQuery,
    pushFiltersToUrl,
  ]);

  const applySidebarFilters = useCallback(() => {
    if (!config) return;

    const defaults = getDefaultFilters(config);
    const nextActiveFilters = { ...activeFilters };
    const nextPendingFilters = { ...pendingFilters };

    for (const id of sidebarFilterIds) {
      if (
        id === DISTANCE_FILTER_ID &&
        config.enableGeolocation &&
        !userLocation
      ) {
        const distanceDefault = defaults[DISTANCE_FILTER_ID];
        if (distanceDefault) {
          nextActiveFilters[DISTANCE_FILTER_ID] = distanceDefault;
          nextPendingFilters[DISTANCE_FILTER_ID] = distanceDefault;
        }
        continue;
      }

      const pending = pendingFilters[id];
      if (pending) {
        const applied = { value: pending.value, isDirty: false };
        nextActiveFilters[id] = applied;
        nextPendingFilters[id] = applied;
      }
    }

    setPendingFilters((prev) =>
      areFilterRecordsEqual(prev, nextPendingFilters) ? prev : nextPendingFilters,
    );
    setActiveFilters((prev) => {
      if (areFilterRecordsEqual(prev, nextActiveFilters)) {
        return prev;
      }

      pushFiltersToUrl(searchQuery, nextActiveFilters);
      return nextActiveFilters;
    });
  }, [
    config,
    activeFilters,
    sidebarFilterIds,
    pendingFilters,
    searchQuery,
    pushFiltersToUrl,
    getDefaultFilters,
    userLocation,
  ]);

  const applyFilters = applySidebarFilters;

  const clearSidebarFilters = useCallback(() => {
    if (!config) return;
    const defaults = getDefaultFilters(config);

    setPendingFilters((prev) => {
      const next = { ...prev };
      for (const id of sidebarFilterIds) {
        next[id] = defaults[id] ?? { value: undefined, isDirty: false };
      }
      return next;
    });

    setActiveFilters((prev) => {
      const next = { ...prev };
      for (const id of sidebarFilterIds) {
        next[id] = defaults[id] ?? { value: undefined, isDirty: false };
      }
      pushFiltersToUrl(searchQuery, next);
      return next;
    });
  }, [
    config,
    getDefaultFilters,
    sidebarFilterIds,
    searchQuery,
    pushFiltersToUrl,
  ]);

  const clearFilters = clearSidebarFilters;

  const clearFilter = useCallback(
    (key: string) => {
      const defaultValue = config?.filters?.find(
        (f) => f.id === key,
      )?.defaultValue;

      const clearedFilter = {
        value: defaultValue,
        isDirty: false,
      };

      setPendingFilters((prev) => ({
        ...prev,
        [key]: clearedFilter,
      }));

      setActiveFilters((prev) => {
        const next = {
          ...prev,
          [key]: clearedFilter,
        };
        pushFiltersToUrl(searchQuery, next);
        return next;
      });
    },
    [config, searchQuery, pushFiltersToUrl],
  );

  const updateFilter = useCallback((key: string, value: unknown) => {
    const updatedFilter = {
      value,
      isDirty: true,
    };

    // setActiveFilters((prev) => ({ ...prev, [key]: updatedFilter }));
    setPendingFilters((prev) => ({ ...prev, [key]: updatedFilter }));
  }, []);

  // ============================================
  // DIRTY FILTER HELPERS
  // ============================================

  const getActiveFilterValues = useCallback((): Record<string, unknown> => {
    const values = extractActiveFilterValues(activeFilters, config);

    if (config?.enableGeolocation && !userLocation) {
      delete values[DISTANCE_FILTER_ID];
    }

    return values;
  }, [activeFilters, config, userLocation]);

  // Get only dirty filters for API calls
  const getDirtyFilters = useCallback((): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    Object.keys(pendingFilters).forEach((key) => {
      const pendingFilter = pendingFilters[key];
      if (pendingFilter && pendingFilter.isDirty) {
        result[key] = pendingFilter.value;
      }
    });
    return result;
  }, [pendingFilters]);

  // Clear dirty tracking
  const clearDirtyFilters = useCallback(() => {
    setPendingFilters((prev) =>
      Object.keys(prev).reduce(
        (acc, key) => {
          const filter = prev[key];
          if (filter) {
            acc[key] = { value: filter.value, isDirty: false };
          }
          return acc;
        },
        {} as Record<string, { value: unknown; isDirty: boolean }>,
      ),
    );
    setActiveFilters((prev) =>
      Object.keys(prev).reduce(
        (acc, key) => {
          const filter = prev[key];
          if (filter) {
            acc[key] = { value: filter.value, isDirty: false };
          }
          return acc;
        },
        {} as Record<string, { value: unknown; isDirty: boolean }>,
      ),
    );
  }, []);

  // ============================================
  // UI ACTIONS
  // ============================================

  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters((prev) => !prev);
  }, []);

  // ============================================
  // URL SYNC
  // ============================================

  // useEffect(() => {
  //   if (!config || !isInitialized || config.syncToUrl === false) return;

  //   if (!hasUrlSynced.current) {
  //     hasUrlSynced.current = true;
  //     return;
  //   }

  //   const getUrlFilters = (): Record<string, unknown> | undefined => {
  //     const urlFilters: Record<string, unknown> = {};
  //     let hasNonDefault = false;

  //     config.filters?.forEach((filterConfig) => {
  //       const current = activeFilters[filterConfig.id];
  //       const defaultVal = filterConfig.defaultValue;
  //       if (JSON.stringify(current) !== JSON.stringify(defaultVal)) {
  //         urlFilters[filterConfig.id] = current;
  //         hasNonDefault = true;
  //       }
  //     });

  //     return hasNonDefault ? urlFilters : undefined;
  //   };

  //   const filtersParam = getUrlFilters();

  //   updateUrl({
  //     query: searchQuery || undefined,
  //     filters: filtersParam ? JSON.stringify(filtersParam) : undefined,
  //   });
  // }, [config, isInitialized, activeFilters, searchQuery]);

  // ============================================
  // CONTEXT VALUE (memoized to prevent unnecessary re-renders)
  // ============================================

  const value: FiltersContextType = useMemo(
    () => ({
      config,
      isInitialized,
      searchQuery,
      pendingSearchQuery,
      activeFilters,
      pendingFilters,
      showMobileFilters,
      isSearchActive,
      isFiltersActive,
      setConfig,
      // updateConfig,
      reset,
      setPendingSearchQuery: setPendingSearchQueryAction,
      applySearch,
      clearSearch,
      setSearchQuery,
      updatePendingFilter,
      applySidebarFilters,
      applyHeaderFilters,
      applyFilters,
      clearSidebarFilters,
      clearFilters,
      clearFilter,
      updateFilter,
      getActiveFilterValues,
      getDirtyFilters,
      clearDirtyFilters,
      hasHeaderPendingChanges,
      hasSidebarPendingChanges,
      hasSidebarActiveFilters,
      requestUserLocation,
      toggleMobileFilters,
      userLocation,
      isRequestingUserLocation,
      hasUserLocationAccess,
    }),
    [
      config,
      isInitialized,
      searchQuery,
      pendingSearchQuery,
      activeFilters,
      pendingFilters,
      showMobileFilters,
      isSearchActive,
      isFiltersActive,
      setConfig,
      // updateConfig,
      reset,
      setPendingSearchQueryAction,
      applySearch,
      clearSearch,
      setSearchQuery,
      updatePendingFilter,
      applySidebarFilters,
      applyHeaderFilters,
      applyFilters,
      clearSidebarFilters,
      clearFilters,
      clearFilter,
      updateFilter,
      getActiveFilterValues,
      getDirtyFilters,
      clearDirtyFilters,
      hasHeaderPendingChanges,
      hasSidebarPendingChanges,
      hasSidebarActiveFilters,
      requestUserLocation,
      toggleMobileFilters,
      userLocation,
      isRequestingUserLocation,
      hasUserLocationAccess,
    ],
  );

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
};

// ============================================
// HOOKS
// ============================================

export const useFilters = (): FiltersContextType => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within FiltersProvider");
  }
  return context;
};

export const useFiltersOptional = (): FiltersContextType | null => {
  return useContext(FiltersContext);
};
