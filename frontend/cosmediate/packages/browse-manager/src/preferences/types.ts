// ============================================
// SORT OPTIONS
// ============================================

export interface SortOption {
  label: string;
  value: string;
  sortBy: string;
  order: "asc" | "desc";
}

// ============================================
// TABLE PREFERENCES
// ============================================

export interface TableSorting {
  id: string;
  desc: boolean;
}

export interface TablePreferences {
  /** Column visibility settings */
  columnVisibility: Record<string, boolean>;
  /** Column sizing settings */
  columnSizing: Record<string, number>;
  /** Column pinning settings */
  columnPinning: {
    left: string[];
    right: string[];
  };
  /** Table sorting state (TanStack SortingState compatible) */
  sorting: TableSorting[];
}

// ============================================
// PREFERENCES CONFIG
// ============================================

export type ViewModes = "grid" | "list" | "table";

export interface PreferencesConfig {
  /** Unique scope identifier for isolation */
  scope: string;
  /** Page type for local storage key */
  pageType: string;
  /** Sort options */
  sortOptions?: SortOption[];
  /** Available view modes */
  viewModes?: ViewModes[];
  /** Default items per page */
  itemsPerPage?: number;
  /** Whether to sync state to URL */
  syncToUrl?: boolean;
  /** Table-specific configuration */
  tableViewConfig?: TableViewConfig;
  /** Force grid view on mobile and tablet screens */
  forceGridViewBelowTab?: boolean;
}

/** Table-specific configuration */
export interface TableViewConfig {
  defaultPageSize?: number;
  enableColumnPinning?: boolean;
  enableColumnResize?: boolean;
  persistSettings?: boolean;
}

// ============================================
// PREFERENCES STATE
// ============================================

export interface PreferencesState {
  /** Current configuration (null until setConfig is called) */
  config: PreferencesConfig | null;
  /** Whether the manager has been initialized */
  isInitialized: boolean;

  // Sort state
  sortBy: string;
  sortOrder: "asc" | "desc";

  // View state
  viewMode: ViewModes;
  itemsPerPage: number;

  // Table-specific state
  tableView: TablePreferences;
}

// ============================================
// PREFERENCES ACTIONS
// ============================================

export interface PreferencesActions {
  /** Set/update the manager configuration */
  setConfig: (config: PreferencesConfig) => void;
  /** Reset to initial state */
  reset: () => void;

  // Sort actions
  updateSort: (sortBy: string, order: "asc" | "desc") => void;

  // View actions
  setViewMode: (mode: ViewModes) => void;
  toggleViewMode: () => void;
  setItemsPerPage: (perPage: number) => void;

  // Table-specific actions
  updateTablePreferences: (preferences: Partial<TablePreferences>) => void;
  resetTablePreferences: () => void;
}

// ============================================
// CONTEXT TYPE
// ============================================

export type PreferencesContextType = PreferencesState & PreferencesActions;

// ============================================
// MEMORY PERSISTENCE
// ============================================

export interface ScopedPreferencesState {
  sortBy: string;
  sortOrder: "asc" | "desc";
  viewMode: ViewModes;
  itemsPerPage: number;
  tableView: TablePreferences;
}
