import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";
import { buildUserProfileListFilters } from "@app/lib/filters";
import { FilterConfig } from "@cosmediate/browse-manager";

const adminListSortOptions = [
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

export const buildAdminsBrowseLayoutConfig = (): BrowseLayoutConfig => {
  const filters = buildUserProfileListFilters(undefined, {
    includeCreationSource: false,
  });

  return {
    filters: {
      scope: "admin-controlpanel-admins",
      pageType: "admin-controlpanel-admins",
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search admins...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: "admin-controlpanel-admins",
      pageType: "admin-controlpanel-admins",
      viewModes: ["table", "grid"] as ("grid" | "list" | "table")[],
      forceGridViewBelowTab: true,
      itemsPerPage: 10,
      tableViewConfig: {
        defaultPageSize: 10,
        enableColumnPinning: true,
        enableColumnResize: true,
        persistSettings: true,
      },
      sortOptions: adminListSortOptions,
      syncToUrl: true,
    },
    showItemCount: true,
  };
};

export const buildAdminAuditLogsPickerBrowseLayoutConfig =
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
        scope: "admin-controlpanel-audit-logs-admins",
        pageType: "admin-controlpanel-audit-logs-admins",
        searchField: {
          id: "search",
          type: "text" as const,
          label: "Search",
          placeholder: "Search admins...",
        },
        filters,
        syncToUrl: true,
      },
      preferences: {
        scope: "admin-controlpanel-audit-logs-admins",
        pageType: "admin-controlpanel-audit-logs-admins",
        viewModes: ["table", "grid"] as ("grid" | "list" | "table")[],
        forceGridViewBelowTab: true,
        itemsPerPage: 10,
        tableViewConfig: {
          defaultPageSize: 10,
          enableColumnPinning: true,
          enableColumnResize: true,
          persistSettings: true,
        },
        sortOptions: adminListSortOptions,
        syncToUrl: true,
      },
      showItemCount: true,
    };
  };
