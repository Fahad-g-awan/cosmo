import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";

import {
  buildAnnouncementSeverityFilter,
  buildAnnouncementStatusFilter,
  buildContentDateRangeFilters,
} from "@app/lib/filters";

export const buildAnnouncementsBrowseLayoutConfig = (): BrowseLayoutConfig => {
  const filters = [
    buildAnnouncementStatusFilter(),
    buildAnnouncementSeverityFilter(),
    ...buildContentDateRangeFilters(false),
    {
      type: "range-date" as const,
      id: "startsAt",
      label: "Starts at",
      defaultValue: [null, null],
    },
    {
      type: "range-date" as const,
      id: "endsAt",
      label: "Ends at",
      defaultValue: [null, null],
    },
  ];

  return {
    filters: {
      scope: "admin-announcements",
      pageType: "admin-announcements",
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search announcements...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: "admin-announcements",
      pageType: "admin-announcements",
      viewModes: ["table"] as ("grid" | "list" | "table")[],
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
          label: "Priority (high-low)",
          value: "priority-desc",
          sortBy: "priority",
          order: "desc" as const,
        },
        {
          label: "Title (A-Z)",
          value: "title-asc",
          sortBy: "title",
          order: "asc" as const,
        },
      ],
      syncToUrl: true,
    },
    showItemCount: true,
  };
};
