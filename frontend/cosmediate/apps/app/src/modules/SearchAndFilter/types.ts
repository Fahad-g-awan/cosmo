import { ReactNode } from "react";
import { Entity } from "@app/types/shared";
import { Histogram } from "@cosmediate/browse-manager/filters";

// ============================================
// BASE TYPES
// ============================================

export interface BaseFilterConfig {
  id: string;
  label: string;
  description?: string;
}

// ============================================
// FILTER CONFIGS
// ============================================

export interface RangeSliderFilterConfig extends BaseFilterConfig {
  type: "range-slider";
  min: number;
  max: number;
  step: number;
  defaultValue: [number, number];
  unit?: string; // e.g., '€', 'km'
  formatValue?: (val: number) => string;
}

export interface RangeBarFilterConfig extends BaseFilterConfig {
  type: "range-bar";
  min: number;
  max: number;
  step: number;
  binCount: number;
  defaultValue: [number, number];
  unit?: string;
  histograms?: Histogram[];
  // Calculate bins from current filtered data
  calculateBins?: (items: Entity[]) => { data: number; count: number }[];
}

export interface CheckboxFilterConfig extends BaseFilterConfig {
  type: "checkbox";
  options: Array<{
    label: string;
    value: string | number;
  }>;
  defaultValue: (string | number)[];
}

export interface RadioFilterConfig extends BaseFilterConfig {
  type: "radio";
  options: Array<{
    label: string;
    value: string | number;
  }>;
  defaultValue: string | number;
}

export interface SelectFilterConfig extends BaseFilterConfig {
  type: "select";
  options: Array<{
    label: string;
    value: string | number;
  }>;
  defaultValue: string | number;
  placeholder?: string;
}

export interface MultiSelectFilterConfig extends BaseFilterConfig {
  type: "multiselect";
  options: Array<{
    label: string;
    value: string | number;
  }>;
  defaultValue: (string | number)[];
  placeholder?: string;
}

export interface RangeDropdownFilterConfig extends BaseFilterConfig {
  type: "range-dropdown";
  min: number;
  max: number;
  step: number;
  defaultValue: [number, number];
  unit?: string;
  options?: Array<{
    label: string;
    value: number;
  }>;
}

export type FilterConfig =
  | RangeSliderFilterConfig
  | RangeBarFilterConfig
  | CheckboxFilterConfig
  | RadioFilterConfig
  | SelectFilterConfig
  | MultiSelectFilterConfig
  | RangeDropdownFilterConfig;

// ============================================
// SEARCH CONFIGS
// ============================================

export interface SearchInputConfig {
  type: "input";
  id: string;
  placeholder: string;
  icon?: ReactNode;
}

export interface LocationSearchConfig {
  type: "location";
  id: string;
  placeholder: string;
  apiEndpoint?: string;
}

export interface DateTimeSearchConfig {
  type: "datetime";
  id: string;
  allowMultipleDates?: boolean;
  allowTimeRange?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export type SearchFieldConfig =
  | SearchInputConfig
  | LocationSearchConfig
  | DateTimeSearchConfig;

// ============================================
// SORT CONFIG
// ============================================

export interface SortOption {
  label: string;
  value: string;
  sortBy: string;
  order: "asc" | "desc";
}

// ============================================
// LAYOUT CONFIG
// ============================================

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface ProductLayoutConfig {
  pageType: "treatments" | "specialists" | "clinics";
  searchFields?: SearchFieldConfig[];
  filters?: FilterConfig[];
  sortOptions?: SortOption[];
  viewModes?: ("grid" | "list")[];
  itemsPerPage?: number;
  breadcrumbs?: BreadcrumbItem[];
}

// ============================================
// FETCH TYPES
// ============================================

export interface FetchParams {
  filters: Record<string, unknown>;
  search: Record<string, unknown>;
  sort: {
    by: string;
    order: "asc" | "desc";
  };
  pagination: {
    page: number;
    limit: number;
    nextToken?: string;
  };
}

export interface FetchResponse {
  items: Entity[];
  total?: number;
  nextToken?: string;
  message: string;
  success: boolean;
}

// ============================================
// CONTEXT STATE
// ============================================

export interface ProductLayoutState {
  config: ProductLayoutConfig;

  // Data
  items: Entity[];
  totalCount: number;

  // Active states
  isSearchActive: boolean;
  isFiltersActive: boolean;

  // Loading states
  isLoading: boolean;
  isSearching: boolean;

  // Filter state (applied)
  activeFilters: Record<string, unknown>;
  // Pending filter state (before apply)
  pendingFilters: Record<string, unknown>;

  // Search state (applied)
  searchQuery: string;
  searchFields: Record<string, unknown>;
  // Pending search state (before apply)
  pendingSearchQuery: string;
  pendingSearchFields: Record<string, unknown>;

  // Sort state
  sortBy: string;
  sortOrder: "asc" | "desc";

  // Cursor-based pagination
  currentPageIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  itemsPerPage: number;

  // View mode
  viewMode: "grid" | "list";

  // UI state
  showMobileFilters: boolean;
}

export interface ProductLayoutActions {
  setItems: (items: Entity[], totalCount: number) => void;
  // Pending filter actions (update local state without triggering fetch)
  updatePendingFilter: (key: string, value: unknown) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  // Legacy - updates and applies immediately (kept for compatibility)
  updateFilter: (key: string, value: unknown) => void;
  // Pending search actions (update local state without triggering fetch)
  updatePendingSearch: (key: string, value: unknown) => void;
  setPendingSearchQuery: (query: string) => void;
  applySearch: () => void;
  clearSearch: () => void;
  clearSearchField: (key: string) => void;
  // Legacy - updates and applies immediately (kept for compatibility)
  updateSearch: (key: string, value: unknown) => void;
  setSearchQuery: (query: string) => void;
  updateSort: (sortBy: string, order: "asc" | "desc") => void;
  goNext: () => Promise<void>;
  goPrevious: () => void;
  setItemsPerPage: (perPage: number) => void;
  setViewMode: (mode: "grid" | "list") => void;
  toggleViewMode: () => void;
  toggleMobileFilters: () => void;
  fetchData: () => Promise<void>;
  refetch: () => Promise<void>;
}

export type ProductLayoutContextType = ProductLayoutState &
  ProductLayoutActions;
