// ============================================
// @cosmediate/browse-manager
// A headless state management package for browsing, filtering, and pagination
// ============================================

// Filters Manager (search + filters)
export {
  FiltersProvider,
  useFilters,
  useFiltersOptional,
} from "./filters/context";
export type {
  FiltersConfig,
  FiltersState,
  FiltersActions,
  FiltersContextType,
  FilterConfig,
  FilterOption,
  AsyncFilterFetchFn,
  SearchFieldConfig,
  ScopedFiltersState,
} from "./filters/types";

// Preferences Manager (sort, view, itemsPerPage)
export {
  PreferencesProvider,
  usePreferences,
  usePreferencesOptional,
} from "./preferences/context";
export type {
  PreferencesConfig,
  PreferencesState,
  PreferencesActions,
  PreferencesContextType,
  SortOption,
  ScopedPreferencesState,
  TablePreferences,
  TableViewConfig,
  ViewModes,
} from "./preferences/types";

// Pagination Manager
export {
  PaginationProvider,
  usePagination,
  usePaginationOptional,
} from "./pagination/context";
export type {
  PaginationState,
  PaginationActions,
  PaginationContextType,
  CursorPage,
  ScopedPaginationState,
} from "./pagination/types";

// Coordinator
export { useDataFetch } from "./coordinator/useDataFetch";
export type {
  FetchParams,
  FetchResponse,
  AnalyticsAdapter,
  UseDataFetchOptions,
  UseDataFetchReturn,
} from "./coordinator/types";

// Utils
export { mapListApiResponse } from "./utils/map-list-api-response";
export { useUrlState } from "./utils/url";
export {
  useLocalPreferences,
  getStorageValue,
  setStorageValue,
} from "./utils/storage";
