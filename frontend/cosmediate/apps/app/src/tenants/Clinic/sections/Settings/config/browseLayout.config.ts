import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";
import { FilterConfig } from "@cosmediate/browse-manager";

export const buildTreatmentResultsBrowseLayoutConfig =
  (): BrowseLayoutConfig => {
    const filters: FilterConfig[] = [
      {
        type: "range-date",
        id: "createdAt",
        label: "Create Date",
        defaultValue: [null, null],
      },
      {
        type: "range-date",
        id: "updatedAt",
        label: "Updated Date",
        defaultValue: [null, null],
      },
    ];

    const browseConfig = {
      filters: {
        scope: "admin-treatments-result",
        pageType: "admin-treatments-result",
        searchField: {
          id: "search",
          type: "text" as const,
          label: "Search",
          placeholder: "Search by treatment name or description...",
        },
        filters,
        syncToUrl: true,
      },
      preferences: {
        scope: "admin-treatments-result",
        pageType: "admin-treatments-result",
        viewModes: ["grid"] as ("grid" | "list" | "table")[],
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

    return browseConfig;
  };
