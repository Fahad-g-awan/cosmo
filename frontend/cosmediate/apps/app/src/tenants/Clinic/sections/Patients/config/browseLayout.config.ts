import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";
import {
  buildUserProfileListFilters,
  type UserBrowseAsyncFetchers,
} from "@app/lib/filters";

export const buildPatientsBrowseLayoutConfig = (
  asyncFetch: UserBrowseAsyncFetchers,
  options: {
    includeClinicFilter?: boolean;
    includeSpecialistFilter?: boolean;
  } = {},
): BrowseLayoutConfig => {
  const {
    includeClinicFilter = true,
    includeSpecialistFilter = true,
  } = options;

  const filters = buildUserProfileListFilters(asyncFetch, {
    includeClinicFilter,
    includeSpecialistFilter,
  });

  const browseConfig = {
    filters: {
      scope: "clinic-patients",
      pageType: "clinic-patients",
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
      scope: "clinic-patients",
      pageType: "clinic-patients",
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
