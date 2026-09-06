import { ReactNode } from "react";
import type {
  FiltersConfig,
  PreferencesConfig,
  FetchParams,
  FetchResponse,
  ViewModes,
} from "@cosmediate/browse-manager";

// ============================================
// BROWSE LAYOUT CONFIG
// ============================================

export interface BrowseLayoutConfig {
  /** Filters configuration for browse-manager */
  filters: FiltersConfig;
  /** Preferences configuration for browse-manager */
  preferences: PreferencesConfig;
  /** Custom header content (optional) */
  customHeader?: ReactNode;
  /** Custom control bar (optional) */
  customControlBar?: ReactNode;
  /** Show item count in pagination */
  showItemCount?: boolean;
}

// ============================================
// BROWSE LAYOUT PROPS
// ============================================

export interface BrowseLayoutProps<T> {
  /** Layout configuration */
  config: BrowseLayoutConfig;
  /** Fetch function for data */
  fetchData: (params: FetchParams) => Promise<FetchResponse<T>>;
  /** Render function for each item */
  renderItem: (item: T, viewMode: ViewModes) => ReactNode;
  /** Loading component */
  loadingComponent?: ReactNode;
  /** Empty state component (no data at all) */
  emptyComponent?: ReactNode;
  /** No results found component (search/filter returned nothing) */
  noResultsComponent?: ReactNode;
  /** Entity type for map locations */
  entity?: "clinics" | "specialists" | "treatments";
  /** Public browse pages fetch without waiting for auth session. Default: true */
  publicBrowse?: boolean;
}

// Re-export types from browse-manager for convenience
export type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
