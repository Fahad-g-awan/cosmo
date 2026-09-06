"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import type {
  CursorPage,
  PaginationContextType,
  ScopedPaginationState,
} from "./types";
import {
  createPaginationMemoryManager,
  registerManager,
} from "../utils/scopeMemory";

// ============================================
// GLOBAL MEMORY STORE
// ============================================

const scopeMemory = createPaginationMemoryManager();
registerManager(scopeMemory);

// ============================================
// CONTEXT
// ============================================

const PaginationContext = createContext<PaginationContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface PaginationProviderProps {
  children: React.ReactNode;
}

export const PaginationProvider = ({ children }: PaginationProviderProps) => {
  // Scope
  const [scope, setScopeState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const previousScopeRef = useRef<string | null>(null);

  // Pagination state
  const [pages, setPages] = useState<CursorPage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationMode, setPaginationMode] = useState<"cursor" | "offset">(
    "offset",
  );

  const refetchRef = useRef<(() => Promise<void>) | null>(null);

  // ============================================
  // DERIVED STATE
  // ============================================

  const items = useMemo(() => {
    if (pages.length === 0) return [];
    return pages[currentIndex]?.items || [];
  }, [pages, currentIndex]);

  const hasNextPage = useMemo(() => {
    if (pages.length === 0) return false;
    const currentPage = pages[currentIndex];
    return Boolean(currentPage?.nextToken) || currentIndex < pages.length - 1;
  }, [pages, currentIndex]);

  const hasPreviousPage = currentIndex > 0;

  // ============================================
  // STATE VALIDATION
  // ============================================

  const isValidState = useCallback((state: ScopedPaginationState): boolean => {
    // Check required fields
    if (
      !Array.isArray(state.pages) ||
      typeof state.currentIndex !== "number" ||
      typeof state.totalCount !== "number" ||
      state.currentIndex < 0 ||
      state.totalCount < 0
    ) {
      return false;
    }

    // Check if currentIndex is within bounds
    if (state.currentIndex >= state.pages.length) {
      return false;
    }

    // Validate page structure
    for (const page of state.pages) {
      if (
        !Array.isArray(page.items) ||
        (page.nextToken !== undefined && typeof page.nextToken !== "string") ||
        (page.total !== undefined && typeof page.total !== "number")
      ) {
        return false;
      }
    }

    return true;
  }, []);

  // ============================================
  // STATE HELPERS
  // ============================================

  const getCurrentState = useCallback(
    (): ScopedPaginationState => ({
      pages,
      currentIndex,
      totalCount,
    }),
    [pages, currentIndex, totalCount]
  );

  const applyState = useCallback((state: ScopedPaginationState) => {
    setPages(state.pages);
    setCurrentIndex(state.currentIndex);
    setTotalCount(state.totalCount);
  }, []);

  // ============================================
  // SET SCOPE
  // ============================================

  const setScope = useCallback(
    (newScope: string) => {
      if (previousScopeRef.current === newScope) {
        return;
      }

      const oldScope = previousScopeRef.current;

      // Save current state if switching scopes (idempotent)
      if (oldScope && oldScope !== newScope && pages.length > 0) {
        const currentState = getCurrentState();
        // Only save if state is meaningful (has data)
        if (currentState.pages.length > 0 || currentState.totalCount > 0) {
          scopeMemory.set(oldScope, currentState);
        }
      }

      // Check for cached state (idempotent restore)
      const cachedState = scopeMemory.get(newScope);

      if (cachedState) {
        // Validate cached state before applying
        if (isValidState(cachedState)) {
          applyState(cachedState);
          setIsInitialized(true);
        } else {
          // Invalid cache, delete and use defaults
          scopeMemory.delete(newScope);
          setPages([]);
          setCurrentIndex(0);
          setTotalCount(0);
          setIsInitialized(false);
        }
      } else {
        // Fresh state
        setPages([]);
        setCurrentIndex(0);
        setTotalCount(0);
        setIsInitialized(false);
      }

      setScopeState(newScope);
      previousScopeRef.current = newScope;
    },
    [pages.length, getCurrentState, applyState, isValidState]
  );

  // ============================================
  // PAGINATION ACTIONS
  // ============================================

  const reset = useCallback(
    (data: {
      items: unknown[];
      nextToken?: string;
      total?: number;
      paginationMode?: "cursor" | "offset";
    }) => {
      const newPage: CursorPage = {
        items: data.items,
        nextToken: data.nextToken,
        total: data.total,
      };
      setPages([newPage]);
      setCurrentIndex(0);
      setPaginationMode(data.paginationMode ?? "offset");
      setTotalCount(
        data.paginationMode === "cursor"
          ? data.items.length
          : data.total ?? data.items.length,
      );
      setIsInitialized(true);

      // Clear memory for current scope on reset
      if (scope && scopeMemory.has(scope)) {
        scopeMemory.delete(scope);
      }
    },
    [scope]
  );

  const appendPage = useCallback(
    (data: {
      items: unknown[];
      nextToken?: string;
      total?: number;
      paginationMode?: "cursor" | "offset";
    }) => {
      const newPage: CursorPage = {
        items: data.items,
        nextToken: data.nextToken,
        total: data.total,
      };
      setPages((prev) => [...prev, newPage]);
      setCurrentIndex((prev) => prev + 1);
      if (data.paginationMode) {
        setPaginationMode(data.paginationMode);
      }
      if (data.paginationMode === "cursor") {
        setTotalCount((prev) => prev + data.items.length);
      } else if (data.total !== undefined) {
        setTotalCount(data.total);
      }
    },
    [],
  );

  const goNext = useCallback(() => {
    if (currentIndex < pages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, pages.length]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const hasNextPageCached = useCallback(() => {
    return currentIndex < pages.length - 1;
  }, [currentIndex, pages.length]);

  const getNextCursor = useCallback(() => {
    if (pages.length === 0) return undefined;
    return pages[currentIndex]?.nextToken;
  }, [pages, currentIndex]);

  const setRefetchFn = (fn: () => Promise<void>) => {
    refetchRef.current = fn;
  };

  const refetchFn = async () => {
    if (refetchRef.current) {
      await refetchRef.current();
    }
  };

  const invalidate = useCallback(() => {
    setPages([]);
    setCurrentIndex(0);
    setTotalCount(0);
    setPaginationMode("offset");
    setIsInitialized(false);

    if (scope && scopeMemory.has(scope)) {
      scopeMemory.delete(scope);
    }
  }, [scope]);

  // ============================================
  // CONTEXT VALUE (memoized to prevent unnecessary re-renders)
  // ============================================

  const value: PaginationContextType = useMemo(
    () => ({
      scope,
      isInitialized,
      pages,
      currentIndex,
      isLoading,
      items,
      totalCount,
      paginationMode,
      hasNextPage,
      hasPreviousPage,
      setScope,
      reset,
      appendPage,
      goNext,
      goPrevious,
      setLoading: setLoadingState,
      hasNextPageCached,
      getNextCursor,
      refetch: refetchFn,
      setRefetchFn,
      invalidate,
    }),
    [
      scope,
      isInitialized,
      pages,
      currentIndex,
      isLoading,
      items,
      totalCount,
      paginationMode,
      hasNextPage,
      hasPreviousPage,
      setScope,
      reset,
      appendPage,
      goNext,
      goPrevious,
      setLoadingState,
      hasNextPageCached,
      getNextCursor,
      invalidate,
    ]
  );

  return (
    <PaginationContext.Provider value={value}>
      {children}
    </PaginationContext.Provider>
  );
};

// ============================================
// HOOKS
// ============================================

export const usePagination = (): PaginationContextType => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error("usePagination must be used within PaginationProvider");
  }
  return context;
};

export const usePaginationOptional = (): PaginationContextType | null => {
  return useContext(PaginationContext);
};
