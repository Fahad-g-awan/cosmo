import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";

import {
  buildSpecialistListFilters,
  type SpecialistBrowseAsyncFetchers,
} from "@app/lib/filters";

export const buildSpecialistsBrowseLayoutConfig = (
  asyncFetch: SpecialistBrowseAsyncFetchers,
): BrowseLayoutConfig => {
  const filters = buildSpecialistListFilters(asyncFetch);

  const browseConfig = {
    filters: {
      scope: "admin-specialists",
      pageType: "admin-specialists",
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search specialists...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: "admin-specialists",
      pageType: "admin-specialists",
      viewModes: ["table", "grid"] as ("grid" | "list" | "table")[],
      forceGridViewBelowTab: true,
      itemsPerPage: 10,
      tableViewConfig: {
        defaultPageSize: 10,
        enableColumnPinning: true,
        enableColumnResize: true,
        persistSettings: true,
      },
      sortOptions: [
        {
          label: "Newest",
          value: "createdAt-desc",
          sortBy: "createdAt",
          order: "desc" as const,
        },
        {
          label: "Oldest",
          value: "createdAt-asc",
          sortBy: "createdAt",
          order: "asc" as const,
        },
        {
          label: "Name (A-Z)",
          value: "name-asc",
          sortBy: "fullName",
          order: "asc" as const,
        },
        {
          label: "Name (Z-A)",
          value: "name-desc",
          sortBy: "fullName",
          order: "desc" as const,
        },
        {
          label: "Highest rating",
          value: "rating-desc",
          sortBy: "rating",
          order: "desc" as const,
        },
      ],
      syncToUrl: true,
    },
    showItemCount: true,
  };

  return browseConfig;
};
