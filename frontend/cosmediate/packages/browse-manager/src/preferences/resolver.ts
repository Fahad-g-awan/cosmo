import type {
  PreferencesConfig,
  ScopedPreferencesState,
  SortOption,
  TablePreferences,
} from "./types";

/**
 * URL parameters extracted from the current URL
 */
export interface UrlParams {
  sort?: string | null;
  view?: string | null;
  perPage?: string | null;
  columns?: string | null;
  pinLeft?: string | null;
  pinRight?: string | null;
  tableSort?: string | null;
  colSizes?: string | null;
}

/**
 * Storage values from localStorage
 */
export interface StorageParams {
  itemsPerPage?: number;
  viewMode?: string;
  defaultSort?: string;
  tableView?: TablePreferences;
}

/**
 * Tracks which URL params were explicitly provided
 */
export interface UrlExplicit {
  sort: boolean;
  view: boolean;
  perPage: boolean;
  columns: boolean;
  pinLeft: boolean;
  pinRight: boolean;
  tableSort: boolean;
  colSizes: boolean;
}

/**
 * Result of resolvePreferences - includes resolved state and URL explicit flags
 */
export interface ResolvedPreferences {
  state: ScopedPreferencesState;
  urlExplicit: UrlExplicit;
}

/**
 * Pure resolver function - computes final preferences from all sources.
 *
 * Priority order: URL > localStorage > defaults
 *
 * This function:
 * - ❌ does NOT write to URL
 * - ❌ does NOT write to localStorage
 * - ❌ does NOT use React state updates
 * - ✅ returns a resolved object + URL explicit flags
 */
export function resolvePreferences({
  config,
  url,
  storage,
  memory,
}: {
  config: PreferencesConfig;
  url: UrlParams;
  storage: StorageParams;
  memory?: ScopedPreferencesState | null;
}): ResolvedPreferences {
  // Track which URL params were explicitly provided
  const urlExplicit: UrlExplicit = {
    sort: !!url.sort,
    view: !!url.view,
    perPage: !!url.perPage,
    columns: !!url.columns,
    pinLeft: !!url.pinLeft,
    pinRight: !!url.pinRight,
    tableSort: !!url.tableSort,
    colSizes: !!url.colSizes,
  };
  // Start with defaults
  const defaultSort = config.sortOptions?.[0];
  const resolved: ScopedPreferencesState = {
    sortBy: defaultSort?.sortBy || "",
    sortOrder: defaultSort?.order || "asc",
    viewMode: config.viewModes?.[0] || "grid",
    itemsPerPage: config.itemsPerPage || 12,
    tableView: {
      columnVisibility: {},
      columnSizing: {},
      columnPinning: { left: [], right: [] },
      sorting: [],
    },
  };

  // ============================================
  // ITEMS PER PAGE: URL > localStorage > memory > default
  // ============================================
  if (url.perPage) {
    const parsed = parseInt(url.perPage, 10);
    if (!isNaN(parsed) && parsed >= 4 && parsed <= 50) {
      resolved.itemsPerPage = parsed;
    }
  } else if (
    typeof storage.itemsPerPage === "number" &&
    storage.itemsPerPage >= 4 &&
    storage.itemsPerPage <= 50
  ) {
    resolved.itemsPerPage = storage.itemsPerPage;
  } else if (
    memory?.itemsPerPage &&
    memory.itemsPerPage >= 4 &&
    memory.itemsPerPage <= 50
  ) {
    resolved.itemsPerPage = memory.itemsPerPage;
  }
  // else: keep default

  // ============================================
  // VIEW MODE: URL > localStorage > memory > default
  // ============================================
  const validViewModes = config.viewModes || ["grid", "list", "table"];
  if (
    url.view &&
    validViewModes.includes(url.view as "grid" | "list" | "table")
  ) {
    resolved.viewMode = url.view as "grid" | "list" | "table";
  } else if (
    storage.viewMode &&
    validViewModes.includes(storage.viewMode as "grid" | "list" | "table")
  ) {
    resolved.viewMode = storage.viewMode as "grid" | "list" | "table";
  } else if (memory?.viewMode && validViewModes.includes(memory.viewMode)) {
    resolved.viewMode = memory.viewMode;
  }
  // else: keep default

  // ============================================
  // SORT: URL > localStorage > memory > default
  // ============================================
  if (url.sort && config.sortOptions) {
    const opt = config.sortOptions.find(
      (o: SortOption) => o.value === url.sort
    );
    if (opt) {
      resolved.sortBy = opt.sortBy;
      resolved.sortOrder = opt.order;
    }
  } else if (storage.defaultSort && config.sortOptions) {
    const opt = config.sortOptions.find(
      (o: SortOption) => o.value === storage.defaultSort
    );
    if (opt) {
      resolved.sortBy = opt.sortBy;
      resolved.sortOrder = opt.order;
    }
  } else if (memory?.sortBy && config.sortOptions) {
    const opt = config.sortOptions.find(
      (o: SortOption) =>
        o.sortBy === memory.sortBy && o.order === memory.sortOrder
    );
    if (opt) {
      resolved.sortBy = opt.sortBy;
      resolved.sortOrder = opt.order;
    }
  }
  // else: keep default

  // ============================================
  // TABLE VIEW: URL columns > localStorage > memory > default
  // ============================================
  // First, apply stored table preferences (sizing, pinning, sorting)
  // Use DEEP MERGE to preserve defaults for missing keys
  if (storage.tableView && typeof storage.tableView === "object") {
    resolved.tableView = {
      ...resolved.tableView,
      ...storage.tableView,
      columnVisibility: {
        ...resolved.tableView.columnVisibility,
        ...storage.tableView.columnVisibility,
      },
      columnSizing: {
        ...resolved.tableView.columnSizing,
        ...storage.tableView.columnSizing,
      },
      columnPinning:
        storage.tableView.columnPinning ?? resolved.tableView.columnPinning,
      sorting: storage.tableView.sorting ?? resolved.tableView.sorting,
    };
  } else if (memory?.tableView) {
    resolved.tableView = {
      ...resolved.tableView,
      ...memory.tableView,
      columnVisibility: {
        ...resolved.tableView.columnVisibility,
        ...memory.tableView.columnVisibility,
      },
      columnSizing: {
        ...resolved.tableView.columnSizing,
        ...memory.tableView.columnSizing,
      },
      columnPinning:
        memory.tableView.columnPinning ?? resolved.tableView.columnPinning,
      sorting: memory.tableView.sorting ?? resolved.tableView.sorting,
    };
  }

  // URL columns override stored visibility (deep merge to preserve other visibility settings)
  if (url.columns) {
    const hiddenColumns = url.columns.split(",").filter(Boolean);
    const urlColumnVisibility: Record<string, boolean> = {};
    // Mark hidden columns as false
    hiddenColumns.forEach((col) => {
      urlColumnVisibility[col] = false;
    });
    resolved.tableView = {
      ...resolved.tableView,
      columnVisibility: {
        ...resolved.tableView.columnVisibility,
        ...urlColumnVisibility,
      },
    };
  }

  // URL pinning overrides stored pinning
  if (url.pinLeft || url.pinRight) {
    resolved.tableView = {
      ...resolved.tableView,
      columnPinning: {
        left: url.pinLeft
          ? url.pinLeft.split(",").filter(Boolean)
          : resolved.tableView.columnPinning.left,
        right: url.pinRight
          ? url.pinRight.split(",").filter(Boolean)
          : resolved.tableView.columnPinning.right,
      },
    };
  }

  // URL table sorting overrides stored sorting (format: "colId:desc,colId2:asc")
  if (url.tableSort) {
    const sortParts = url.tableSort.split(",").filter(Boolean);
    const sorting = sortParts
      .map((part) => {
        const [id, direction] = part.split(":");
        if (!id) return null;
        return { id, desc: direction === "desc" };
      })
      .filter((s): s is { id: string; desc: boolean } => s !== null);
    resolved.tableView = {
      ...resolved.tableView,
      sorting,
    };
  }

  // URL column sizes override stored sizes (format: "colId:width,colId2:width")
  if (url.colSizes) {
    const sizeParts = url.colSizes.split(",").filter(Boolean);
    const columnSizing: Record<string, number> = {
      ...resolved.tableView.columnSizing,
    };
    sizeParts.forEach((part) => {
      const [id, width] = part.split(":");
      if (!id || !width) return;
      const parsedWidth = parseInt(width, 10);
      if (!isNaN(parsedWidth) && parsedWidth > 0) {
        columnSizing[id] = parsedWidth;
      }
    });
    resolved.tableView = {
      ...resolved.tableView,
      columnSizing,
    };
  }

  return { state: resolved, urlExplicit };
}
