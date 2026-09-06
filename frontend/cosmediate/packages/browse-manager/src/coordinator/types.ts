// ============================================
// FETCH PARAMS
// ============================================

export interface FetchParams {
  filters?: Record<string, unknown>;
  search?: {
    query?: string;
    [key: string]: unknown;
  };
  sort?: {
    by: string;
    order: "asc" | "desc";
  };
  pagination?: {
    page?: number;
    limit?: number;
    nextToken?: string;
  };
}

// ============================================
// FETCH RESPONSE
// ============================================

export interface FetchResponse<T = unknown> {
  items: T[];
  nextToken?: string;
  total?: number;
  paginationMode?: "cursor" | "offset";
}

// ============================================
// ANALYTICS ADAPTER
// ============================================

export interface AnalyticsAdapter {
  trackEvent: (name: string, data?: Record<string, unknown>) => void;
}

// ============================================
// DATA FETCH OPTIONS
// ============================================

export interface UseDataFetchOptions<T = unknown> {
  /** Function to fetch data */
  fetchData: (
    params: FetchParams,
    accessToken?: string
  ) => Promise<FetchResponse<T>>;
  /** Optional analytics adapter */
  analytics?: AnalyticsAdapter;
  /** Whether to auto-fetch when state changes (default: true) */
  autoFetch?: boolean;
  /** When false, fetch without waiting for an auth session (public browse pages). */
  requireAuth?: boolean;
}

// ============================================
// DATA FETCH RETURN
// ============================================

export interface UseDataFetchReturn {
  /** Run initial fetch (resets pagination) */
  runInitial: () => Promise<void>;
  /** Fetch next page */
  runNext: () => Promise<void>;
  /** Go to previous page (no fetch, uses cache) */
  goPrevious: () => void;
  /** Refetch current data */
  refetch: () => Promise<void>;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether coordinator is ready */
  isReady: boolean;
}
