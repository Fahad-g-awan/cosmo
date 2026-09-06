"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import type {
  PreferencesConfig,
  PreferencesContextType,
  ScopedPreferencesState,
  SortOption,
  TablePreferences,
} from "./types";
import { useUrlState } from "../utils/url";
import { useLocalPreferences } from "../utils/storage";
import {
  createPreferencesMemoryManager,
  registerManager,
} from "../utils/scopeMemory";
import { resolvePreferences } from "./resolver";
import { useResponsive } from "../hooks/useResponsive";

// ============================================
// GLOBAL MEMORY STORE
// ============================================

const scopeMemory = createPreferencesMemoryManager();
registerManager(scopeMemory);

// ============================================
// CONTEXT
// ============================================

const PreferencesContext = createContext<PreferencesContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface PreferencesProviderProps {
  children: React.ReactNode;
}

export const PreferencesProvider = ({ children }: PreferencesProviderProps) => {
  const { updateUrl, getValue } = useUrlState();
  const { isMobileView, isTabletView } = useResponsive();

  // Config state
  const [config, setConfigState] = useState<PreferencesConfig | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Previous scope ref
  const previousScopeRef = useRef<string | null>(null);

  // Track if we've done initial resolution for current config
  const hasResolvedRef = useRef(false);
  const pendingConfigRef = useRef<PreferencesConfig | null>(null);

  // Local preferences
  const {
    preferences,
    isLoaded: preferencesLoaded,
    setPreference,
  } = useLocalPreferences(config?.pageType || "default");

  // Sort state (placeholders until setConfig + resolvePreferences runs)
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // View state
  const [viewMode, setViewModeState] = useState<"grid" | "list" | "table">(
    "grid"
  );
  // itemsPerPage is always a number after resolution
  const [itemsPerPage, setItemsPerPageState] = useState<number>(12);

  // Table state
  const [tableView, setTableView] = useState<TablePreferences>({
    columnVisibility: {},
    columnSizing: {},
    columnPinning: { left: [], right: [] },
    sorting: [],
  });

  // ============================================
  // STATE VALIDATION
  // ============================================

  const isValidState = useCallback(
    (state: ScopedPreferencesState, cfg: PreferencesConfig): boolean => {
      // Check required fields
      if (
        typeof state.sortBy !== "string" ||
        (state.sortOrder !== "asc" && state.sortOrder !== "desc") ||
        (state.viewMode !== "grid" &&
          state.viewMode !== "list" &&
          state.viewMode !== "table") ||
        typeof state.itemsPerPage !== "number" ||
        state.itemsPerPage < 4 ||
        state.itemsPerPage > 50
      ) {
        return false;
      }

      // Check if sortBy is valid for config
      if (state.sortBy && cfg.sortOptions) {
        const validSort = cfg.sortOptions.some(
          (opt) => opt.sortBy === state.sortBy && opt.order === state.sortOrder
        );
        if (!validSort) return false;
      }

      // Check if viewMode is valid for config
      if (cfg.viewModes && !cfg.viewModes.includes(state.viewMode)) {
        return false;
      }

      return true;
    },
    []
  );

  // ============================================
  // STATE HELPERS
  // ============================================

  const getCurrentState = useCallback(
    (): ScopedPreferencesState => ({
      sortBy,
      sortOrder,
      viewMode,
      itemsPerPage,
      tableView,
    }),
    [sortBy, sortOrder, viewMode, itemsPerPage, tableView]
  );

  const applyState = useCallback((state: ScopedPreferencesState) => {
    setSortBy(state.sortBy);
    setSortOrder(state.sortOrder);
    setViewModeState(state.viewMode);
    setItemsPerPageState(state.itemsPerPage);
    setTableView(
      state.tableView || {
        columnVisibility: {},
        columnSizing: {},
        columnPinning: { left: [], right: [] },
        sorting: [],
      }
    );
  }, []);

  const getInitialState = useCallback(
    (cfg: PreferencesConfig): ScopedPreferencesState => {
      const defaultSort = cfg.sortOptions?.[0];
      return {
        sortBy: defaultSort?.sortBy || "",
        sortOrder: defaultSort?.order || "asc",
        viewMode: cfg.viewModes?.[0] || "grid",
        itemsPerPage: cfg.itemsPerPage || 12,
        tableView: {
          columnVisibility: {},
          columnSizing: {},
          columnPinning: { left: [], right: [] },
          sorting: [],
        },
      };
    },
    []
  );

  /**
   * ====================================
   * Helper
   * ====================================
   */
  const pushPrefsToUrl = useCallback(
    (next: {
      sortBy: string;
      sortOrder: "asc" | "desc";
      viewMode: "grid" | "list" | "table";
      itemsPerPage: number;
      columnVisibility?: Record<string, boolean>;
      columnPinning?: { left: string[]; right: string[] };
      sorting?: Array<{ id: string; desc: boolean }>;
      columnSizing?: Record<string, number>;
    }) => {
      if (!config || config.syncToUrl === false) return;

      const currentSortValue = config.sortOptions?.find(
        (opt) => opt.sortBy === next.sortBy && opt.order === next.sortOrder
      )?.value;

      const defaultSortValue = config.sortOptions?.[0]?.value;
      const defaultViewMode = config.viewModes?.[0] || "grid";
      const defaultItemsPerPage = config.itemsPerPage || 12;

      // Convert column visibility to a comma-separated string of hidden columns
      const hiddenColumns = next.columnVisibility
        ? Object.entries(next.columnVisibility)
            .filter(([, visible]) => !visible)
            .map(([colId]) => colId)
            .join(",")
        : undefined;

      // Convert pinning to comma-separated strings
      const pinLeft = next.columnPinning?.left?.length
        ? next.columnPinning.left.join(",")
        : undefined;
      const pinRight = next.columnPinning?.right?.length
        ? next.columnPinning.right.join(",")
        : undefined;

      // Convert table sorting to "colId:desc,colId2:asc" format
      const tableSort = next.sorting?.length
        ? next.sorting
            .map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`)
            .join(",")
        : undefined;

      // Convert column sizes to "colId:width,colId2:width" format
      const colSizes = next.columnSizing
        ? Object.entries(next.columnSizing)
            .filter(([, width]) => width > 0)
            .map(([colId, width]) => `${colId}:${Math.round(width)}`)
            .join(",")
        : undefined;

      updateUrl({
        sort:
          currentSortValue !== defaultSortValue ? currentSortValue : undefined,
        view: next.viewMode !== defaultViewMode ? next.viewMode : undefined,
        perPage:
          next.itemsPerPage !== defaultItemsPerPage
            ? String(next.itemsPerPage)
            : undefined,
        columns:
          hiddenColumns && hiddenColumns.length > 0 ? hiddenColumns : undefined,
        pinLeft: pinLeft || undefined,
        pinRight: pinRight || undefined,
        tableSort: tableSort || undefined,
        colSizes: colSizes && colSizes.length > 0 ? colSizes : undefined,
      });
    },
    [config, updateUrl]
  );

  // ============================================
  // SET CONFIG
  // ============================================

  const setConfig = useCallback(
    (newConfig: PreferencesConfig) => {
      const newScope = newConfig.scope;
      const oldScope = previousScopeRef.current;

      // Save current state if switching scopes (idempotent)
      if (oldScope && oldScope !== newScope && isInitialized) {
        const currentState = getCurrentState();
        // Only save if state is meaningful
        if (
          currentState.sortBy ||
          currentState.viewMode !== "grid" ||
          currentState.itemsPerPage !== 12
        ) {
          scopeMemory.set(oldScope, currentState);
        }
      }

      // Store pending config - resolution will happen when localStorage is ready
      pendingConfigRef.current = newConfig;
      hasResolvedRef.current = false;
      setConfigState(newConfig);
      previousScopeRef.current = newScope;
    },
    [getCurrentState, isInitialized]
  );

  // ============================================
  // RESOLUTION EFFECT - runs ONCE when config AND localStorage are both ready
  // ============================================

  useEffect(() => {
    const cfg = pendingConfigRef.current;
    if (!cfg || !preferencesLoaded || hasResolvedRef.current) return;

    // 2.1 Get URL params and check if any are present
    const urlParams = {
      sort: getValue("sort"),
      view: getValue("view"),
      perPage: getValue("perPage"),
      columns: getValue("columns"),
      pinLeft: getValue("pinLeft"),
      pinRight: getValue("pinRight"),
      tableSort: getValue("tableSort"),
      colSizes: getValue("colSizes"),
    };
    const hasAnyUrlPrefs =
      !!urlParams.sort ||
      !!urlParams.view ||
      !!urlParams.perPage ||
      !!urlParams.columns ||
      !!urlParams.pinLeft ||
      !!urlParams.pinRight ||
      !!urlParams.tableSort ||
      !!urlParams.colSizes;

    // 2.2 Resolve (URL > LS > defaults) - LRU NOT used here
    const { state: resolved } = resolvePreferences({
      config: cfg,
      url: urlParams,
      storage: {
        itemsPerPage: preferences.itemsPerPage as number | undefined,
        viewMode: preferences.viewMode as string | undefined,
        defaultSort: preferences.defaultSort as string | undefined,
        tableView: preferences.tableView as TablePreferences | undefined,
      },
      memory: null, // LRU handled separately below
    });

    // 2.3 Optionally use LRU ONLY if URL is empty
    let finalState = resolved;
    if (!hasAnyUrlPrefs) {
      const cached = scopeMemory.get(cfg.scope);
      if (cached && isValidState(cached, cfg)) {
        // LRU only beats defaults and only when URL is clean
        finalState = cached;
      } else if (cached) {
        scopeMemory.delete(cfg.scope);
      }
    }

    // 2.4 Apply state
    applyState(finalState);

    // Step 3: Canonicalize URL once after init (backfill from LS)
    if (cfg.syncToUrl !== false) {
      pushPrefsToUrl({
        sortBy: finalState.sortBy,
        sortOrder: finalState.sortOrder,
        viewMode: finalState.viewMode,
        itemsPerPage: finalState.itemsPerPage,
        columnVisibility: finalState.tableView?.columnVisibility,
        columnPinning: finalState.tableView?.columnPinning,
        sorting: finalState.tableView?.sorting,
        columnSizing: finalState.tableView?.columnSizing,
      });
    }

    // Mark resolution complete
    hasResolvedRef.current = true;
    setIsInitialized(true);
  }, [
    preferencesLoaded,
    preferences,
    getValue,
    applyState,
    isValidState,
    pushPrefsToUrl,
  ]);

  // ============================================
  // RESPONSIVE VIEW MODE EFFECT
  // ============================================

  // Track user's preferred view mode before responsive override
  const userPreferredViewModeRef = useRef<"grid" | "list" | "table" | null>(
    null
  );
  const wasSmallScreenRef = useRef(false);

  useEffect(() => {
    if (!config || !isInitialized) return;

    const isSmallScreen = isMobileView || isTabletView;
    const shouldForceGrid = config.forceGridViewBelowTab && isSmallScreen;

    if (shouldForceGrid && viewMode !== "grid") {
      // Save user's preferred view mode before forcing grid
      if (!wasSmallScreenRef.current) {
        userPreferredViewModeRef.current = viewMode;
      }
      setViewModeState("grid");
      wasSmallScreenRef.current = true;
    } else if (!isSmallScreen && wasSmallScreenRef.current) {
      // Restore user's preferred view mode when returning to desktop
      wasSmallScreenRef.current = false;
      if (
        userPreferredViewModeRef.current &&
        userPreferredViewModeRef.current !== "grid" &&
        config.viewModes?.includes(userPreferredViewModeRef.current)
      ) {
        setViewModeState(userPreferredViewModeRef.current);
      }
      userPreferredViewModeRef.current = null;
    }
  }, [config, isInitialized, isMobileView, isTabletView, viewMode]);

  // ============================================
  // RESET
  // ============================================

  const reset = useCallback(() => {
    if (!config) return;
    const initialState = getInitialState(config);
    applyState(initialState);

    // Idempotent delete - only delete if exists
    if (config.scope && scopeMemory.has(config.scope)) {
      scopeMemory.delete(config.scope);
    }

    // Reset URL to defaults
    pushPrefsToUrl(initialState);
  }, [config, getInitialState, applyState, pushPrefsToUrl]);

  // ============================================
  // SORT ACTIONS
  // ============================================

  const updateSort = useCallback(
    (newSortBy: string, order: "asc" | "desc") => {
      setSortBy(newSortBy);
      setSortOrder(order);

      // Persist on user action
      pushPrefsToUrl({
        sortBy: newSortBy,
        sortOrder: order,
        viewMode,
        itemsPerPage,
      });

      // Save to localStorage
      const sortOptionValue = config?.sortOptions?.find(
        (opt: SortOption) => opt.sortBy === newSortBy && opt.order === order
      )?.value;
      if (sortOptionValue) {
        setPreference("defaultSort", sortOptionValue);
      }
    },
    [config, setPreference, pushPrefsToUrl, itemsPerPage, viewMode]
  );

  // ============================================
  // VIEW ACTIONS
  // ============================================

  const setViewMode = useCallback(
    (mode: "grid" | "list" | "table") => {
      setViewModeState(mode);
      // Persist on user action
      setPreference("viewMode", mode);
      pushPrefsToUrl({ sortBy, sortOrder, viewMode: mode, itemsPerPage });
    },
    [setPreference, pushPrefsToUrl, sortBy, sortOrder, itemsPerPage]
  );

  const toggleViewMode = useCallback(() => {
    const modes = config?.viewModes || ["grid", "list"];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    setViewMode(newMode as "grid" | "list" | "table");
  }, [viewMode, setViewMode, config?.viewModes]);

  const setItemsPerPage = useCallback(
    (perPage: number) => {
      const clampedValue = Math.max(4, Math.min(50, perPage));
      setItemsPerPageState(clampedValue);
      // Persist on user action
      setPreference("itemsPerPage", clampedValue);
      pushPrefsToUrl({
        sortBy,
        sortOrder,
        viewMode,
        itemsPerPage: clampedValue,
      });
    },
    [setPreference, pushPrefsToUrl, sortBy, sortOrder, viewMode]
  );

  // ============================================
  // TABLE PREFERENCES ACTIONS
  // ============================================

  const updateTablePreferences = useCallback(
    (preferences: Partial<TablePreferences>) => {
      // Deep merge to prevent losing nested properties
      const newTableView: TablePreferences = {
        ...tableView,
        ...preferences,
        columnVisibility: {
          ...tableView.columnVisibility,
          ...preferences.columnVisibility,
        },
        columnSizing: {
          ...tableView.columnSizing,
          ...preferences.columnSizing,
        },
        columnPinning: preferences.columnPinning ?? tableView.columnPinning,
        sorting: preferences.sorting ?? tableView.sorting,
      };
      setTableView(newTableView);

      // Save to local storage if enabled
      if (config?.tableViewConfig?.persistSettings) {
        setPreference("tableView", newTableView);
      }

      // Sync all table state to URL on user action
      if (config?.syncToUrl !== false) {
        pushPrefsToUrl({
          sortBy,
          sortOrder,
          viewMode,
          itemsPerPage,
          columnVisibility: newTableView.columnVisibility,
          columnPinning: newTableView.columnPinning,
          sorting: newTableView.sorting,
          columnSizing: newTableView.columnSizing,
        });
      }
    },
    [
      tableView,
      config?.tableViewConfig?.persistSettings,
      config?.syncToUrl,
      setPreference,
      sortBy,
      sortOrder,
      viewMode,
      itemsPerPage,
      pushPrefsToUrl,
    ]
  );

  const resetTablePreferences = useCallback(() => {
    const defaultTableView: TablePreferences = {
      columnVisibility: {},
      columnSizing: {},
      columnPinning: { left: [], right: [] },
      sorting: [],
    };
    setTableView(defaultTableView);

    if (config?.tableViewConfig?.persistSettings) {
      setPreference("tableView", defaultTableView);
    }
  }, [config?.tableViewConfig?.persistSettings, setPreference]);

  // ============================================
  // CONTEXT VALUE (memoized to prevent unnecessary re-renders)
  // ============================================

  const value: PreferencesContextType = useMemo(
    () => ({
      config,
      isInitialized,
      sortBy,
      sortOrder,
      viewMode,
      itemsPerPage,
      tableView,
      setConfig,
      reset,
      updateSort,
      setViewMode,
      toggleViewMode,
      setItemsPerPage,
      updateTablePreferences,
      resetTablePreferences,
    }),
    [
      config,
      isInitialized,
      sortBy,
      sortOrder,
      viewMode,
      itemsPerPage,
      tableView,
      setConfig,
      reset,
      updateSort,
      setViewMode,
      toggleViewMode,
      setItemsPerPage,
      updateTablePreferences,
      resetTablePreferences,
    ]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

// ============================================
// HOOKS
// ============================================

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
};

export const usePreferencesOptional = (): PreferencesContextType | null => {
  return useContext(PreferencesContext);
};
