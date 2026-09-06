"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { PaginatedAsyncFetchFn, PaginatedAsyncOption } from "../types";
import { PAGINATED_ASYNC_DEFAULT_DEBOUNCE_MS } from "../types";

function mergeOptions(
  base: PaginatedAsyncOption[],
  extras: PaginatedAsyncOption[],
): PaginatedAsyncOption[] {
  if (!extras.length) return base;

  const seen = new Set(base.map((item) => item.value));
  const merged = [...base];

  for (const option of extras) {
    if (seen.has(option.value)) continue;

    seen.add(option.value);
    merged.push(option);
  }

  return merged;
}

export interface UsePaginatedAsyncOptionsConfig {
  fetchPage: PaginatedAsyncFetchFn;
  enabled?: boolean;
  debounceMs?: number;
  reloadKey?: string | number;
  seedOptions?: PaginatedAsyncOption[];
  lazy?: boolean;
  open?: boolean;
}

export interface UsePaginatedAsyncOptionsResult {
  items: PaginatedAsyncOption[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  search: string;
  setSearch: (value: string) => void;
  loadMore: () => void;
  reload: () => void;
}

export function usePaginatedAsyncOptions({
  fetchPage,
  enabled = true,
  debounceMs = PAGINATED_ASYNC_DEFAULT_DEBOUNCE_MS,
  reloadKey,
  seedOptions = [],
  lazy = false,
  open = false,
}: UsePaginatedAsyncOptionsConfig): UsePaginatedAsyncOptionsResult {
  const [items, setItems] = useState<PaginatedAsyncOption[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const seedOptionsRef = useRef(seedOptions);
  const fetchPageRef = useRef(fetchPage);
  const loadingMoreRef = useRef(false);
  const requestIdRef = useRef(0);

  fetchPageRef.current = fetchPage;
  seedOptionsRef.current = seedOptions;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  useEffect(() => {
    if (!enabled) return;
    if (lazy && !open) return;

    let cancelled = false;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    fetchPageRef
      .current({
        search: debouncedSearch || undefined,
        nextToken: null,
      })
      .then((result) => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setItems(mergeOptions(result.items, seedOptionsRef.current));
        setNextToken(result.nextToken ?? null);
      })
      .catch((err) => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load options");
        setItems(seedOptionsRef.current);
        setNextToken(null);
      })
      .finally(() => {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, enabled, lazy, open, reloadKey]);

  const loadMore = useCallback(async () => {
    if (!enabled || !nextToken || loadingMoreRef.current || loading) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    const requestId = requestIdRef.current;

    try {
      const result = await fetchPageRef.current({
        search: debouncedSearch || undefined,
        nextToken,
      });

      if (requestId !== requestIdRef.current) return;

      setItems((prev) => mergeOptions(prev, result.items));
      setNextToken(result.nextToken ?? null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [debouncedSearch, enabled, loading, nextToken]);

  const reload = useCallback(() => {
    requestIdRef.current += 1;
    setSearch("");
    setDebouncedSearch("");
    setItems([]);
    setNextToken(null);
  }, []);

  const displayItems = useMemo(
    () => mergeOptions(items, seedOptions),
    [items, seedOptions],
  );

  return {
    items: displayItems,
    loading,
    loadingMore,
    error,
    hasMore: Boolean(nextToken),
    search,
    setSearch,
    loadMore,
    reload,
  };
}
