import type { PaginatedAsyncFetchFn, PaginatedAsyncOption } from "../types";
import { PAGINATED_ASYNC_DEFAULT_PAGE_SIZE } from "../types";

type ListResponse<T> = {
  items?: T[];
  nextToken?: string | null;
  success?: boolean;
};

type ManagementListBody = {
  pagination?: { limit?: number; nextToken?: string };
  search?: { query?: string };
  filters?: Record<string, unknown>;
  sort?: Record<string, unknown>;
};

export type CreateManagementListFetcherConfig<T> = {
  /** Any management POST `/list` client (`getManagement*Api`). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchList: (body: any, accessToken: string) => Promise<ListResponse<T>>;
  accessToken: string | undefined | null;
  mapOption: (item: T) => PaginatedAsyncOption;
  pageSize?: number;
  filters?: Record<string, unknown>;
  sort?: Record<string, unknown>;
  enabled?: boolean;
};

/** Builds a `PaginatedAsyncFetchFn` around management POST list APIs. */
export function createManagementListFetcher<T>({
  fetchList,
  accessToken,
  mapOption,
  pageSize = PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
  filters,
  sort,
  enabled = true,
}: CreateManagementListFetcherConfig<T>): PaginatedAsyncFetchFn {
  return async ({ search, nextToken }) => {
    if (!enabled || !accessToken) {
      return { items: [], nextToken: null };
    }

    const body: ManagementListBody = {
      pagination: {
        limit: pageSize,
        ...(nextToken ? { nextToken } : {}),
      },
      ...(search ? { search: { query: search } } : {}),
      ...(filters ? { filters } : {}),
      ...(sort ? { sort } : {}),
    };

    const response = await fetchList(body, accessToken);

    return {
      items: (response.items ?? []).map(mapOption),
      nextToken: response.nextToken ?? null,
    };
  };
}
