import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";
import { FilterConfig } from "@cosmediate/browse-manager";

import {
  getLogActionFilterOptions,
  getLogScopeFilterOptions,
} from "@app/lib/platform-logs";

export const buildActivityLogsBrowseLayoutConfig = (
  scope = "admin-activity-monitoring",
): BrowseLayoutConfig => {
  const filters: FilterConfig[] = [
    {
      type: "text",
      id: "actorId",
      label: "Actor ID",
      placeholder: "Filter by actor id",
      defaultValue: "",
    },
    {
      type: "select",
      id: "scope",
      label: "Scope",
      options: getLogScopeFilterOptions(),
      defaultValue: [],
    },
    {
      type: "select",
      id: "action",
      label: "Action",
      options: getLogActionFilterOptions(),
      defaultValue: [],
    },
    {
      type: "range-date",
      id: "createdAt",
      label: "Date",
      defaultValue: [null, null],
    },
  ];

  return {
    filters: {
      scope,
      pageType: scope,
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search activity logs...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope,
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
      ],
      syncToUrl: true,
    },
    showItemCount: true,
  };
};
