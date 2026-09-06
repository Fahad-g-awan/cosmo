import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";
import { FilterConfig } from "@cosmediate/browse-manager";

import {
  buildManagerListFilters,
  normalizeManagerListFilters,
  type ManagerBrowseAsyncFetchers,
} from "@app/lib/filters";

export const buildManagersBrowseLayoutConfig = (
  asyncFetch: ManagerBrowseAsyncFetchers,
): BrowseLayoutConfig => {
  const filters: FilterConfig[] = buildManagerListFilters(asyncFetch);

  const browseConfig = {
    filters: {
      scope: "clinic-controlpanel-maanagers",
      pageType: "clinic-controlpanel-maanagers",
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
      scope: "clinic-controlpanel-maanagers",
      pageType: "clinic-controlpanel-maanagers",
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

export { normalizeManagerListFilters };

const managerListSortOptions = [
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
];

export const buildManagerAuditLogsPickerBrowseLayoutConfig =
  (): BrowseLayoutConfig => {
    const filters: FilterConfig[] = [
      {
        type: "select",
        id: "status",
        label: "Status",
        options: [
          { label: "Active", value: "ACTIVE" },
          { label: "Blocked", value: "BLOCKED" },
          { label: "Pending", value: "PENDING" },
        ],
        defaultValue: [],
      },
    ];

    return {
      filters: {
        scope: "clinic-controlpanel-audit-logs-managers",
        pageType: "clinic-controlpanel-audit-logs-managers",
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
        scope: "clinic-controlpanel-audit-logs-managers",
        pageType: "clinic-controlpanel-audit-logs-managers",
        viewModes: ["table", "grid"] as ("grid" | "list" | "table")[],
        forceGridViewBelowTab: true,
        itemsPerPage: 10,
        tableViewConfig: {
          defaultPageSize: 10,
          enableColumnPinning: true,
          enableColumnResize: true,
          persistSettings: true,
        },
        sortOptions: managerListSortOptions,
        syncToUrl: true,
      },
      showItemCount: true,
    };
  };
