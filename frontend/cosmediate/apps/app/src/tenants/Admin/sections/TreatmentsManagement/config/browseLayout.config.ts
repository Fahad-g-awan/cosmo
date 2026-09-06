import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";

import {
  buildContentDateRangeFilters,
  buildCountRangeFilter,
  buildPriceRangeFilter,
  buildPublishedBooleanFilter,
  buildSearchClicksRangeFilter,
  buildTreatmentBrandAsyncFilter,
  buildTreatmentCategoryAsyncFilter,
} from "@app/lib/filters";
import type { AsyncFilterFetchFn } from "@cosmediate/browse-manager";

export const buildTreatmentCategoriesBrowseLayoutConfig =
  (): BrowseLayoutConfig => {
    const filters = [
      buildPublishedBooleanFilter(),
      buildCountRangeFilter("treatmentCount", "Treatment count"),
      ...buildContentDateRangeFilters(false),
    ];

    const browseConfig = {
      filters: {
        scope: "admin-treatments-categories",
        pageType: "admin-treatments-categories",
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
        scope: "admin-treatments-categories",
        pageType: "admin-treatments-categories",
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
        ],
        syncToUrl: true,
      },
      showItemCount: true,
    };

    return browseConfig;
  };

export const buildTreatmentBrandsBrowseLayoutConfig =
  (): BrowseLayoutConfig => {
    const filters = [
      buildPublishedBooleanFilter(),
      ...buildContentDateRangeFilters(false),
    ];

    const browseConfig = {
      filters: {
        scope: "admin-treatments-brands",
        pageType: "admin-treatments-brands",
        searchField: {
          id: "search",
          type: "text" as const,
          label: "Search",
          placeholder: "Search brands...",
        },
        filters,
        syncToUrl: true,
      },
      preferences: {
        scope: "admin-treatments-brands",
        pageType: "admin-treatments-brands",
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
        ],
        syncToUrl: true,
      },
      showItemCount: true,
    };

    return browseConfig;
  };

export const buildTreatmentsBrowseLayoutConfig = (
  scope: string,
  categoryAsyncFetch: AsyncFilterFetchFn,
  brandAsyncFetch: AsyncFilterFetchFn,
): BrowseLayoutConfig => {
  const filters = [
    buildTreatmentCategoryAsyncFilter(categoryAsyncFetch),
    buildTreatmentBrandAsyncFilter(brandAsyncFetch),
    buildPublishedBooleanFilter(),
    buildPriceRangeFilter(),
    buildCountRangeFilter("specialistCount", "Specialists"),
    buildCountRangeFilter("clinicCount", "Clinics"),
    buildSearchClicksRangeFilter(),
    ...buildContentDateRangeFilters(false),
  ];

  const browseConfig = {
    filters: {
      scope: scope,
      pageType: scope,
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search treatments...",
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
          sortBy: "name",
          order: "asc" as const,
        },
        {
          label: "Name (Z-A)",
          value: "name-desc",
          sortBy: "name",
          order: "desc" as const,
        },
      ],
      syncToUrl: true,
    },
    showItemCount: true,
  };

  return browseConfig;
};
