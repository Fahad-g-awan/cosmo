import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";
// import { FilterConfig } from "@cosmediate/browse-manager";

import {
  buildClinicCategoryListFilters,
  buildClinicListFilters,
  buildManagerListFilters,
  type ClinicBrowseAsyncFetchers,
  type ManagerBrowseAsyncFetchers,
} from "@app/lib/filters";

export const buildClinicCategoriesBrowseLayoutConfig =
  (): BrowseLayoutConfig => {
    const filters = buildClinicCategoryListFilters();

    const browseConfig = {
      filters: {
        scope: "admin-clinics-categories",
        pageType: "admin-clinics-categories",
        searchField: {
          id: "search",
          type: "text" as const,
          label: "Search",
          placeholder: "Search categories...",
        },
        filters,
        syncToUrl: true,
      },
      preferences: {
        scope: "admin-clinics-categories",
        pageType: "admin-clinics-categories",
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
            sortBy: "name",
            order: "asc" as const,
          },
          {
            label: "Name (Z-A)",
            value: "name-desc",
            sortBy: "name",
            order: "desc" as const,
          },
          {
            label: "Most clinics",
            value: "clinicCount-desc",
            sortBy: "clinicCount",
            order: "desc" as const,
          },
        ],
        syncToUrl: true,
      },
      showItemCount: true,
    };

    return browseConfig;
  };

export const buildManagerBrowseLayoutConfig = (
  scope: string,
  asyncFetch: ManagerBrowseAsyncFetchers,
): BrowseLayoutConfig => {
  const filters = buildManagerListFilters(asyncFetch);

  const browseConfig = {
    filters: {
      scope: scope,
      pageType: scope,
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search managers...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: scope,
      pageType: scope,
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

export const buildClinicBrowseLayoutConfig = (
  asyncFetch: ClinicBrowseAsyncFetchers,
): BrowseLayoutConfig => {
  const filters = buildClinicListFilters(asyncFetch);

  const browseConfig = {
    filters: {
      scope: "admin-clinicManagement-clinics",
      pageType: "admin-clinicManagement-clinics",
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search clinics...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: "admin-clinicManagement-clinics",
      pageType: "admin-clinicManagement-clinics",
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
          sortBy: "name",
          order: "asc" as const,
        },
        {
          label: "Name (Z-A)",
          value: "name-desc",
          sortBy: "name",
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
