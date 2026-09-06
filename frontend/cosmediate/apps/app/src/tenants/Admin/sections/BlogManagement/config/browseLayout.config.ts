import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";

import {
  buildBlogAuthorAsyncFilter,
  buildBlogCategoryAsyncFilter,
  buildBlogStatusFilter,
  buildContentDateRangeFilters,
  buildCountRangeFilter,
  buildPublishedBooleanFilter,
} from "@app/lib/filters";
import type { AsyncFilterFetchFn } from "@cosmediate/browse-manager";

export const buildBlogsBrowseLayoutConfig = (
  categoryAsyncFetch: AsyncFilterFetchFn,
  authorAsyncFetch: AsyncFilterFetchFn,
): BrowseLayoutConfig => {
  const filters = [
    buildBlogCategoryAsyncFilter(categoryAsyncFetch),
    buildBlogAuthorAsyncFilter(authorAsyncFetch),
    buildBlogStatusFilter(),
    ...buildContentDateRangeFilters(true),
  ];

  const browseConfig = {
    filters: {
      scope: "admin-blogs",
      pageType: "admin-blogs",
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search blogs...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: "admin-blogs",
      pageType: "admin-blogs",
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
          label: "Title (A-Z)",
          value: "title-asc",
          sortBy: "title",
          order: "asc" as const,
        },
        {
          label: "Title (Z-A)",
          value: "title-desc",
          sortBy: "title",
          order: "desc" as const,
        },
      ],
      syncToUrl: true,
    },
    showItemCount: true,
  };

  return browseConfig;
};

export const buildBlogCategoriesBrowseLayoutConfig = (): BrowseLayoutConfig => {
  const filters = [
    buildPublishedBooleanFilter(),
    buildCountRangeFilter("blogCount", "Blog count"),
    ...buildContentDateRangeFilters(false),
  ];

  const browseConfig = {
    filters: {
      scope: "admin-blogs-categories",
      pageType: "admin-blogs-categories",
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
      scope: "admin-blogs-categories",
      pageType: "admin-blogs-categories",
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
