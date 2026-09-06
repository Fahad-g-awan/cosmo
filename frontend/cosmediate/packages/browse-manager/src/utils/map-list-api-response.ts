import type { FetchResponse } from "../coordinator/types";

type ListApiResponse<T> = {
  success?: boolean;
  items?: T[];
  nextToken?: string;
  total?: number;
  paginationMode?: "cursor" | "offset";
};

/** Maps `*Api` list responses into browse-manager fetch results. */
export function mapListApiResponse<T>(
  response: ListApiResponse<T>,
): FetchResponse<T> {
  if (response.success === false) {
    return { items: [], total: 0 };
  }

  return {
    items: response.items ?? [],
    nextToken: response.nextToken,
    total: response.total ?? response.items?.length ?? 0,
    paginationMode: response.paginationMode,
  };
}
