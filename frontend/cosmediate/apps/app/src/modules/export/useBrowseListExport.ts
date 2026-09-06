"use client";

import { useEffect, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { useFilters, usePreferences } from "@cosmediate/browse-manager";

import { usePanelHeader } from "@app/layout/management/context";

import { buildFilterSummary } from "./build-filter-summary";
import { useListExport } from "./ListExportContext";
import type { ListExportConfig } from "./types";

interface UseBrowseListExportArgs<T> {
  exportConfig?: ListExportConfig;
  columns: ColumnDef<T>[];
  items: T[];
  columnVisibility: Record<string, boolean>;
}

export function useBrowseListExport<T>({
  exportConfig,
  columns,
  items,
  columnVisibility,
}: UseBrowseListExportArgs<T>): void {
  const { register, unregister } = useListExport();
  const { panelHeaderConfig } = usePanelHeader();
  const { searchQuery, activeFilters, config: filtersConfig } = useFilters();
  const { sortBy, sortOrder, config: prefsConfig } = usePreferences();

  const title = useMemo(() => {
    if (!exportConfig) return "";
    return (
      exportConfig.title ??
      panelHeaderConfig?.pageTitle ??
      exportConfig.slug
    );
  }, [exportConfig, panelHeaderConfig?.pageTitle]);

  const getFilterSummary = useMemo(
    () => () =>
      buildFilterSummary({
        searchQuery,
        filterConfigs: filtersConfig?.filters ?? [],
        activeFilters,
        sortBy,
        sortOrder,
        sortOptions: prefsConfig?.sortOptions,
      }),
    [
      searchQuery,
      filtersConfig?.filters,
      activeFilters,
      sortBy,
      sortOrder,
      prefsConfig?.sortOptions,
    ],
  );

  useEffect(() => {
    if (!exportConfig) return;

    register({
      slug: exportConfig.slug,
      title,
      columns: columns as ColumnDef<unknown>[],
      items: items as unknown[],
      columnVisibility,
      getFilterSummary,
    });

    return () => {
      unregister(exportConfig.slug);
    };
  }, [
    exportConfig,
    title,
    columns,
    items,
    columnVisibility,
    getFilterSummary,
    register,
    unregister,
  ]);
}
