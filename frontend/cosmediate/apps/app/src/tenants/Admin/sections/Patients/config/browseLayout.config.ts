import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";
import {
  buildUserProfileListFilters,
  type UserBrowseAsyncFetchers,
} from "@app/lib/filters";

export const buildPatientsBrowseLayoutConfig = (
  asyncFetch: UserBrowseAsyncFetchers,
): BrowseLayoutConfig => {
  const filters = buildUserProfileListFilters(asyncFetch, {
    includeClinicFilter: true,
    includeSpecialistFilter: true,
  });

  const browseConfig = {
    filters: {
      scope: "admin-patients",
      pageType: "admin-patients",
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search patients...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: "admin-patients",
      pageType: "admin-patients",
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
      ],
      syncToUrl: true,
    },
    showItemCount: true,
  };

  return browseConfig;
};
