// ============================================
// FILTER CONFIG TYPES
// ============================================

export interface FilterOption {
  label: string;
  value: string | number;
}

/** Paginated list loader for async browse filters. */
export type AsyncFilterFetchFn = (params: {
  search?: string;
  nextToken?: string | null;
}) => Promise<{ items: FilterOption[]; nextToken?: string | null }>;

export interface UserLocation {
  lat: number;
  lon: number;
}

export interface Histogram {
  priceFrom: number;
  priceTo: number;
  count: number;
}

export interface FilterConfig {
  id: string;
  type:
    | "select"
    | "multiselect"
    | "async-select"
    | "async-multiselect"
    | "range-slider"
    | "range-dropdown"
    | "range-bar"
    | "checkbox"
    | "radio"
    | "rating"
    | "location"
    | "datetime"
    | "range-date"
    | "text";
  label: string;
  options?: FilterOption[];
  /** Server-paginated options loader for async-select / async-multiselect filters. */
  asyncFetch?: AsyncFilterFetchFn;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  step?: number;
  binCount?: number;
  placeholder?: string;
  histograms?: Histogram[];
  /** When true, filter is shown but not interactive (e.g. coming soon). */
  disabled?: boolean;
  /** UI rendering hint for flexible display */
  uiType?:
    | "select"
    | "checkbox"
    | "radio"
    | "range"
    | "dateRange"
    | "slider"
    | "field";
  /** How the filter should be displayed */
  displayMode?: "inline" | "dropdown" | "drawer" | "field";
  /** Dashboard-specific configuration */
  dashboardConfig?: {
    /** Show as separate input fields (for date/range selectors) */
    showAsField?: boolean;
    /** Field-specific props */
    fieldProps?: {
      fromPlaceholder?: string;
      toPlaceholder?: string;
      format?: string;
    };
    /** Layout direction */
    direction?: "row" | "column";
  };
}

export interface SearchFieldConfig {
  id: string;
  type: "text";
  label: string;
  placeholder?: string;
}

// ============================================
// FILTERS MANAGER CONFIG
// ============================================

export interface FiltersConfig {
  /** Unique scope identifier for isolation */
  scope: string;
  /** Page type for analytics */
  pageType: string;
  /** Search query configuration (single text field) */
  searchField?: SearchFieldConfig;
  /** Filter configurations (includes location, datetime, etc.) */
  filters?: FilterConfig[];
  /** Whether to sync state to URL */
  syncToUrl?: boolean;
  /** Request browser geolocation for the distance filter (public clinics/specialists). */
  enableGeolocation?: boolean;
}

// ============================================
// FILTERS STATE
// ============================================

export interface FiltersState {
  /** Current configuration (null until setConfig is called) */
  config: FiltersConfig | null;
  /** Whether the manager has been initialized */
  isInitialized: boolean;

  // Search state (applied) - single query string
  searchQuery: string;

  // Pending search state (before apply)
  pendingSearchQuery: string;

  // Filter state (applied) - includes location, datetime, etc.
  activeFilters: Record<string, { value: unknown; isDirty: boolean }>;

  // Pending filter state (before apply)
  pendingFilters: Record<string, { value: unknown; isDirty: boolean }>;

  // UI state
  showMobileFilters: boolean;

  // Derived states
  isSearchActive: boolean;
  isFiltersActive: boolean;

  // User location data
  userLocation: UserLocation | null;
  isRequestingUserLocation: boolean;
  hasUserLocationAccess: boolean;
}

// ============================================
// FILTERS ACTIONS
// ============================================

export interface FiltersActions {
  /** Set/update the manager configuration */
  setConfig: (config: FiltersConfig) => void;
  /** Update config options only (without resetting filter values) */
  // updateConfig: (config: FiltersConfig) => void;
  /** Reset to initial state */
  reset: () => void;

  // Search actions (query only)
  setPendingSearchQuery: (query: string) => void;
  applySearch: () => void;
  clearSearch: () => void;

  // Immediate search action
  setSearchQuery: (query: string) => void;

  // Filter actions (includes location, datetime, etc.)
  updatePendingFilter: (key: string, value: unknown) => void;
  /** Commit sidebar filters only (price, brands, distance, etc.). */
  applySidebarFilters: () => void;
  /** Commit search query and header filters (location) only. */
  applyHeaderFilters: () => void;
  /** @deprecated Use applySidebarFilters */
  applyFilters: () => void;
  /** Reset sidebar filters only. */
  clearSidebarFilters: () => void;
  /** @deprecated Use clearSidebarFilters */
  clearFilters: () => void;
  /** Immediately clear a single filter in pending and active state. */
  clearFilter: (key: string) => void;

  // Immediate filter action
  updateFilter: (key: string, value: unknown) => void;

  /** Applied filter values that differ from defaults (full payload for API). */
  getActiveFilterValues: () => Record<string, unknown>;

  // Get only dirty filters for API calls
  getDirtyFilters: () => Record<string, unknown>;
  // Clear dirty tracking
  clearDirtyFilters: () => void;

  // Pending vs active helpers for UI button states
  hasHeaderPendingChanges: boolean;
  hasSidebarPendingChanges: boolean;
  hasSidebarActiveFilters: boolean;

  /** Prompt browser geolocation (distance filter on public browse pages). */
  requestUserLocation: () => Promise<boolean>;

  // UI actions
  toggleMobileFilters: () => void;
}

// ============================================
// CONTEXT TYPE
// ============================================

export type FiltersContextType = FiltersState & FiltersActions;

// ============================================
// MEMORY PERSISTENCE
// ============================================

export interface ScopedFiltersState {
  searchQuery: string;
  pendingSearchQuery: string;
  activeFilters: Record<string, { value: unknown; isDirty: boolean }>;
  pendingFilters: Record<string, { value: unknown; isDirty: boolean }>;
}
