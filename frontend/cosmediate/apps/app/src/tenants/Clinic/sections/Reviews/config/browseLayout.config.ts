import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";
import { FilterConfig } from "@cosmediate/browse-manager";

export const buildReviewsBrowseLayoutConfig = (): BrowseLayoutConfig => {
  const filters: FilterConfig[] = [
    {
      type: "range-date",
      id: "createdAt",
      label: "Create Date",
      defaultValue: [null, null],
    },
    {
      type: "range-dropdown",
      id: "rating",
      label: "Rating",
      defaultValue: [],
      options: [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
        { label: "5", value: 5 },
        { label: "6", value: 6 },
        { label: "7", value: 7 },
        { label: "8", value: 8 },
        { label: "9", value: 9 },
        { label: "10", value: 10 },
      ],
    },
  ];

  const browseConfig = {
    filters: {
      scope: "clinic-reviews",
      pageType: "clinic-reviews",
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search reviews text...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: "clinic-reviews",
      pageType: "clinic-reviews",
      // viewModes: ["table", "grid"] as ("grid" | "list" | "table")[],
      // itemsPerPage: 10,
      // tableViewConfig: {
      //   defaultPageSize: 10,
      //   enableColumnPinning: true,
      //   enableColumnResize: true,
      //   persistSettings: true,
      // },
      // sortOptions: [
      //   {
      //     label: "Name (A-Z)",
      //     value: "name-asc",
      //     sortBy: "fullName",
      //     order: "asc" as const,
      //   },
      //   {
      //     label: "Name (Z-A)",
      //     value: "name-desc",
      //     sortBy: "fullName",
      //     order: "desc" as const,
      //   },
      //   {
      //     label: "Newest",
      //     value: "createdAt-desc",
      //     sortBy: "createdAt",
      //     order: "desc" as const,
      //   },
      //   {
      //     label: "Oldest",
      //     value: "createdAt-asc",
      //     sortBy: "createdAt",
      //     order: "asc" as const,
      //   },
      // ],
      syncToUrl: true,
    },
    showItemCount: false,
  };

  return browseConfig;
};
