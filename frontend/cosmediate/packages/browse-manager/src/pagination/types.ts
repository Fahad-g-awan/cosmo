// ============================================
// PAGINATION PAGE
// ============================================

import { Dispatch, SetStateAction } from "react";

export interface CursorPage<T = unknown> {
  items: T[];
  nextToken?: string;
  total?: number;
}

// ============================================
// PAGINATION STATE
// ============================================

export interface PaginationState {
  /** Unique scope identifier */
  scope: string | null;
  /** Whether the manager has been initialized */
  isInitialized: boolean;
  /** All fetched pages */
  pages: CursorPage[];
  /** Current page index */
  currentIndex: number;
  /** Loading state */
  isLoading: boolean;
  /** Items for current page */
  items: unknown[];
  /** Total count (if available) */
  totalCount: number;
  /** Cursor lists may not expose a stable total */
  paginationMode: "cursor" | "offset";
  /** Whether there's a next page */
  hasNextPage: boolean;
  /** Whether there's a previous page */
  hasPreviousPage: boolean;
  /** Refetch function */
  refetch: () => Promise<void>;
}

// ============================================
// PAGINATION ACTIONS
// ============================================

export interface PaginationActions {
  /** Set scope for isolation */
  setScope: (scope: string) => void;
  /** Reset pagination with initial data */
  reset: (data: {
    items: unknown[];
    nextToken?: string;
    total?: number;
    paginationMode?: "cursor" | "offset";
  }) => void;
  /** Append a new page */
  appendPage: (data: {
    items: unknown[];
    nextToken?: string;
    total?: number;
    paginationMode?: "cursor" | "offset";
  }) => void;
  /** Go to next page */
  goNext: () => void;
  /** Go to previous page */
  goPrevious: () => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Check if next page is cached */
  hasNextPageCached: () => boolean;
  /** Get next cursor token */
  getNextCursor: () => string | undefined;
  /** Refetch function */
  setRefetchFn: (fn: () => Promise<void>) => void;
  /** Invalidate pagination state */
  invalidate: () => void;
}

// ============================================
// CONTEXT TYPE
// ============================================

export type PaginationContextType = PaginationState & PaginationActions;

// ============================================
// MEMORY PERSISTENCE
// ============================================

export interface ScopedPaginationState {
  pages: CursorPage[];
  currentIndex: number;
  totalCount: number;
}
