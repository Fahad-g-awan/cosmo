"use client";

import React from "react";

import {
  ColumnDef,
  VisibilityState,
  ColumnSizingState,
  ColumnPinningState,
  SortingState,
} from "@tanstack/react-table";
import { GridViewLoader, NoDataFound } from "@cosmediate/ui";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { cn } from "@cosmediate/ui/lib/utils";

import PanelCard from "@app/modules/PanelViews/PanelCard";
import Table from "@app/modules/PanelViews/Table";

/**
 * =========================================================
 * CONTENT RENDERER COMPONENT
 *
 * Shared component for rendering table/card views
 * =========================================================
 */

export interface ContentRendererProps<T> {
  data: T[];
  columns?: ColumnDef<T>[];
  renderCard?: (item: T) => React.ReactNode;
  viewMode: "table" | "grid" | "list";
  isLoading: boolean;
  enableColumnPinning?: boolean;
  enableColumnResizing?: boolean;

  // Required controlled state from PreferencesProvider
  columnVisibility: VisibilityState;
  columnSizing: ColumnSizingState;
  columnPinning: ColumnPinningState;
  sorting: SortingState;
  pageSize: number;

  // Required callbacks to emit changes to PreferencesProvider
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
  onColumnSizingChange: (sizing: ColumnSizingState) => void;
  onColumnPinningChange: (pinning: ColumnPinningState) => void;
  onSortingChange: (sorting: SortingState) => void;
}

export function ContentRenderer<T>({
  data,
  columns = [],
  renderCard,
  viewMode,
  isLoading,
  enableColumnPinning = false,
  enableColumnResizing = true,
  columnVisibility,
  columnSizing,
  columnPinning,
  sorting,
  pageSize,
  onColumnVisibilityChange,
  onColumnSizingChange,
  onColumnPinningChange,
  onSortingChange,
}: ContentRendererProps<T>) {
  const { isMobileView, isTabletView } = useWindowWidth();

  /**
   * ====================================
   * Grid/List view
   * ====================================
   */
  if (
    viewMode === "grid" ||
    viewMode === "list" ||
    isMobileView ||
    isTabletView
  ) {
    if (isLoading) {
      return <GridViewLoader />;
    }
    if (!isLoading && data.length === 0) {
      return (
        <NoDataFound
          message="No Data Found"
          description="Please try again later or contact support"
          className="my-10"
        />
      );
    }

    /**
     * ====================================
     * Custom renderCard if provided
     * ====================================
     */
    if (renderCard) {
      return (
        <div
          className={cn(
            "w-full pr-1 overflow-y-auto overflow-lite",
            isTabletView || isMobileView ? "h-[45dvh]" : "h-[58dvh]",
          )}
        >
          <div
            className={cn(
              "w-full grid gap-5",
              viewMode === "grid"
                ? "grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1"
                : "grid-cols-1",
            )}
          >
            {data.map((item, index) => (
              <React.Fragment key={index}>{renderCard(item)}</React.Fragment>
            ))}
          </div>
        </div>
      );
    }

    /**
     * ====================================
     * Default card view
     * ====================================
     */
    return (
      <div
        className={cn(
          "w-full pr-1 overflow-y-auto overflow-lite",
          isTabletView || isMobileView ? "h-[45dvh]" : "h-[58dvh]",
        )}
      >
        <PanelCard
          data={data as unknown as Record<string, unknown>[]}
          columns={
            columns as unknown as ColumnDef<Record<string, unknown>, unknown>[]
          }
        />
      </div>
    );
  }

  /**
   * ===================================================
   * Desktop default table view when view mode is table
   * ===================================================
   */
  if (viewMode === "table" && columns.length > 0) {
    return (
      <div
        className={cn(
          "w-full h-[58dvh] relative",
          data?.length === 0 || isLoading
            ? "overflow-hidden"
            : "overflow-auto overflow-lite",
        )}
      >
        <Table
          data={data}
          columns={columns}
          columnVisibility={columnVisibility}
          columnSizing={columnSizing}
          columnPinning={columnPinning}
          sorting={sorting}
          pageSize={pageSize}
          onColumnVisibilityChange={onColumnVisibilityChange}
          onColumnSizingChange={onColumnSizingChange}
          onColumnPinningChange={onColumnPinningChange}
          onSortingChange={onSortingChange}
          isLoading={isLoading}
          enableColumnPinning={enableColumnPinning}
          enableColumnResizing={enableColumnResizing}
        />
      </div>
    );
  } else if (viewMode === "table" && columns.length < 1) {
    return (
      <NoDataFound
        message="No Data Found"
        description="Please try again later or contact support"
        className="my-10"
      />
    );
  }

  return null;
}

export default ContentRenderer;
