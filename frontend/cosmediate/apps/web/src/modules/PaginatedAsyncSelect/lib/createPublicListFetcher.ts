import type { PaginatedAsyncFetchFn, PaginatedAsyncOption } from "../types";
import { PAGINATED_ASYNC_DEFAULT_PAGE_SIZE } from "../types";

type ListResponse<T> = {
  items?: T[];
  nextToken?: string | null;
  success?: boolean;
};

/**
 * Matches public POST `/list` request bodies (`GetTreatmentsRequest`, `GetClinicsRequest`, etc.).
 */
type PublicListBody = {
  filters?: Record<string, unknown>;
  search?: Record<string, unknown>;
  sort?: {
    by: string;
    order: "asc" | "desc";
  };
  pagination?: {
    page?: number;
    limit?: number;
    nextToken?: string;
  };
};

export type CreatePublicListFetcherConfig<T> = {
  fetchList: (body: PublicListBody) => Promise<ListResponse<T>>;
  mapOption: (item: T) => PaginatedAsyncOption;
  pageSize?: number;
  filters?: Record<string, unknown>;
  sort?: PublicListBody["sort"];
  enabled?: boolean;
};

/** Builds a `PaginatedAsyncFetchFn` around public POST list APIs. */
export function createPublicListFetcher<T>({
  fetchList,
  mapOption,
  pageSize = PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
  filters,
  sort,
  enabled = true,
}: CreatePublicListFetcherConfig<T>): PaginatedAsyncFetchFn {
  return async ({ search, nextToken }) => {
    if (!enabled) {
      return { items: [], nextToken: null };
    }

    const body: PublicListBody = {
      pagination: {
        limit: pageSize,
        ...(nextToken ? { nextToken } : {}),
      },
      ...(search ? { search: { query: search } } : {}),
      ...(filters ? { filters } : {}),
      ...(sort ? { sort } : {}),
    };

    const response = await fetchList(body);

    if (!response.success) {
      return { items: [], nextToken: null };
    }

    return {
      items: (response.items ?? []).map(mapOption),
      nextToken: response.nextToken ?? null,
    };
  };
}
