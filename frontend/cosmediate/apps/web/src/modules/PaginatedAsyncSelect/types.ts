import type { ReactNode } from "react";

/** One selectable row in a paginated async dropdown. */
export type PaginatedAsyncOption = {
  value: string;
  label: ReactNode;
  searchText?: string;
  disabled?: boolean;
};

export type PaginatedAsyncFetchParams = {
  search?: string;
  nextToken?: string | null;
};

export type PaginatedAsyncFetchResult = {
  items: PaginatedAsyncOption[];
  nextToken?: string | null;
};

/** `(search?, nextToken?) => { items, nextToken }` — page size is set by the fetcher. */
export type PaginatedAsyncFetchFn = (
  params: PaginatedAsyncFetchParams,
) => Promise<PaginatedAsyncFetchResult>;

export const PAGINATED_ASYNC_DEFAULT_PAGE_SIZE = 20;
export const PAGINATED_ASYNC_SWITCHER_PAGE_SIZE = 10;
export const PAGINATED_ASYNC_DEFAULT_DEBOUNCE_MS = 300;
export const PAGINATED_ASYNC_SCROLL_THRESHOLD_PX = 48;
