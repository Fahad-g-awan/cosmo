import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";
import { FilterConfig } from "@cosmediate/browse-manager";

export const buildAppointmentsRequestConfig = (): BrowseLayoutConfig => {
  const filters: FilterConfig[] = [
    {
      type: "range-date",
      id: "createdAt",
      label: "Create Date",
      defaultValue: [null, null],
    },
    {
      type: "select",
      id: "status",
      label: "Status",
      options: [
        { label: "Upcoming", value: "upcoming" },
        { label: "Approved", value: "approved" },
        { label: "Cancelled", value: "cancelled" },
        { label: "No Show", value: "no show" },
        { label: "Past", value: "past" },
      ],
      defaultValue: [],
    },
  ];

  const browseConfig = {
    filters: {
      scope: "user-appointments",
      pageType: "user-appointments",
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search appointments...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: "user-appointments",
      pageType: "user-appointments",
      viewModes: ["table"] as ("grid" | "list" | "table")[],
      forceGridViewBelowTab: true,
      itemsPerPage: 5,
      tableViewConfig: {
        defaultPageSize: 5,
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
          label: "Date (Soonest)",
          value: "date-asc",
          sortBy: "metadata.date",
          order: "asc" as const,
        },
        {
          label: "Date (Latest)",
          value: "date-desc",
          sortBy: "metadata.date",
          order: "desc" as const,
        },
      ],
      syncToUrl: true,
    },
    showItemCount: true,
  };

  return browseConfig;
};
