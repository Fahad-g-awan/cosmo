import { useMemo } from "react";

import { getClinicsApi, getTreatmentsApi } from "@cosmediate/api";
import type { Clinic, Treatment } from "@cosmediate/type-utils";
import type { AsyncFilterFetchFn } from "@cosmediate/browse-manager";

import {
  createPublicListFetcher,
  PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
  type PaginatedAsyncFetchFn,
} from "@web/modules/PaginatedAsyncSelect";

function toAsyncFilterFetch(
  fetchPage: PaginatedAsyncFetchFn,
): AsyncFilterFetchFn {
  return async (params) => {
    const result = await fetchPage(params);
    return {
      items: result.items.map((item) => ({
        value: item.value,
        label:
          typeof item.label === "string"
            ? item.label
            : String(item.searchText ?? item.value),
      })),
      nextToken: result.nextToken,
    };
  };
}

export function useTreatmentBrowseFetcher(): AsyncFilterFetchFn {
  return useMemo(() => {
    const fetchPage = createPublicListFetcher<Treatment>({
      fetchList: getTreatmentsApi,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (treatment) => ({
        value: treatment.id,
        label: treatment.name,
        searchText: treatment.name,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, []);
}

export function useClinicBrowseFetcher(): AsyncFilterFetchFn {
  return useMemo(() => {
    const fetchPage = createPublicListFetcher<Clinic>({
      fetchList: getClinicsApi,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (clinic) => ({
        value: clinic.id,
        label: clinic.name,
        searchText: `${clinic.name} ${clinic.city ?? ""} ${clinic.completeAddress ?? ""}`,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, []);
}
