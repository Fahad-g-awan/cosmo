"use client";

import React, { useEffect, useMemo, useRef } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import {
  useDataFetch,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";

import type { ListExportConfig } from "@app/modules/export";
import { useBrowseListExport } from "@app/modules/export";

import { PaginationControls } from "./components/PaginationControls";
import { ContentRenderer } from "./components/ContentRenderer";
import { ControlBar } from "./components/control-bar";

/**
 * =================================================================
 * BROWSE CONTENT COMPONENT
 * Renders the actual content based on state
 * =================================================================
 */

export interface BrowseContentProps<T> {
  columns?: ColumnDef<T>[];
  renderCard?: (item: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  enableColumnPinning?: boolean;
  enableColumnResizing?: boolean;

  /** Initial pinned columns - will be applied to preferences if not already set */
  initialPinnedColumns?: {
    left?: string[];
    right?: string[];
  };
  fetchData: (
    params: FetchParams,
    accessToken?: string
  ) => Promise<FetchResponse<T>>;
  showPagination?: boolean;
  showControlBar?: boolean;
  showItemCount?: boolean;
  showViewModeToggle?: boolean;
  hideColumnSelector?: boolean;
  showRefreshButton?: boolean;
  exportConfig?: ListExportConfig;
}

export function BrowseContent<T>({
  columns = [],
  renderCard,
  // loadingComponent,
  // emptyComponent,
  enableColumnPinning = false,
  enableColumnResizing = true,
  initialPinnedColumns,
  fetchData,
  showPagination = true,
  showControlBar = true,
  showItemCount = true,
  showViewModeToggle = true,
  hideColumnSelector = false,
  showRefreshButton = true,
  exportConfig,
}: BrowseContentProps<T>) {
  const hasAppliedInitialPinning = useRef(false);

  const { isLoading, runNext, goPrevious } = useDataFetch({
    fetchData,
    autoFetch: true,
  });
  const {
    isInitialized,
    viewMode,
    setViewMode,
    itemsPerPage,
    setItemsPerPage,
    tableView,
    updateTablePreferences,
  } = usePreferences();
  const {
    items,
    currentIndex,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    paginationMode,
    reset,
  } = usePagination();

  const data = items as T[];

  useBrowseListExport({
    exportConfig,
    columns,
    items: data,
    columnVisibility: tableView.columnVisibility,
  });

  // Determine actual view mode (list falls back to grid)
  const actualViewMode = useMemo(() => {
    if (viewMode === "list" || viewMode === "grid") return "grid";
    return viewMode as "table" | "grid";
  }, [viewMode]);

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    updateTablePreferences({
      columnVisibility: {
        ...tableView.columnVisibility,
        [columnId]: visible,
      },
    });
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    reset({ items: [], total: 0 });
  };

  /**
   * =================================================================
   * Apply initial pinned columns if provided and not already set
   * Guard with isInitialized to ensure preferences are resolved first
   * =================================================================
   */
  useEffect(() => {
    if (!isInitialized) return;

    if (
      initialPinnedColumns &&
      !hasAppliedInitialPinning.current &&
      tableView.columnPinning.left.length === 0 &&
      tableView.columnPinning.right.length === 0
    ) {
      hasAppliedInitialPinning.current = true;
      updateTablePreferences({
        columnPinning: {
          left: initialPinnedColumns.left || [],
          right: initialPinnedColumns.right || [],
        },
      });
    }
  }, [
    isInitialized,
    initialPinnedColumns,
    tableView.columnPinning,
    updateTablePreferences,
  ]);

  return (
    <div className="w-full flex flex-col items-center justify-start gap-1">
      {showControlBar && (
        <ControlBar
          viewMode={actualViewMode}
          onViewModeChange={setViewMode}
          totalCount={totalCount}
          showItemCount={showItemCount}
          columns={columns}
          columnVisibility={tableView.columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          pageSize={itemsPerPage}
          onPageSizeChange={handlePageSizeChange}
          showViewModeToggle={showViewModeToggle}
          hideColumnSelector={hideColumnSelector}
          showRefreshButton={showRefreshButton}
        />
      )}

      <ContentRenderer
        data={data}
        columns={columns}
        renderCard={renderCard}
        viewMode={actualViewMode}
        isLoading={isLoading}
        enableColumnPinning={enableColumnPinning}
        enableColumnResizing={enableColumnResizing}
        columnVisibility={tableView.columnVisibility}
        columnSizing={tableView.columnSizing}
        columnPinning={tableView.columnPinning}
        sorting={tableView.sorting}
        pageSize={itemsPerPage ?? 10}
        onColumnVisibilityChange={(visibility) =>
          updateTablePreferences({ columnVisibility: visibility })
        }
        onColumnSizingChange={(sizing) =>
          updateTablePreferences({ columnSizing: sizing })
        }
        onColumnPinningChange={(pinning) =>
          updateTablePreferences({
            columnPinning: {
              left: pinning.left ?? [],
              right: pinning.right ?? [],
            },
          })
        }
        onSortingChange={(sorting) => updateTablePreferences({ sorting })}
      />

      {showPagination && (
        <PaginationControls
          currentPage={currentIndex}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          isLoading={isLoading}
          onNext={runNext}
          onPrevious={goPrevious}
          itemsPerPage={itemsPerPage}
          paginationMode={paginationMode}
        />
      )}
    </div>
  );
}
