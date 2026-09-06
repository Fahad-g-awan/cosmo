import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  ColumnResizeMode,
  VisibilityState,
  ColumnSizingState,
  ColumnPinningState,
} from "@tanstack/react-table";

import { SmallLoader } from "@cosmediate/ui/index";
import { cn } from "@cosmediate/ui/lib/utils";

import { TableHead } from "./components/Head";
import { TableBody } from "./components/Body";

import { MdOutlineSpaceDashboard } from "react-icons/md";

/**
 * PURE CONTROLLED TABLE COMPONENT
 *
 * This component owns NOTHING except rendering.
 * All state must come from props (PreferencesProvider).
 * All changes emit via callbacks.
 *
 * Ownership map:
 * - columnVisibility  → PreferencesProvider
 * - columnSizing      → PreferencesProvider
 * - columnPinning     → PreferencesProvider
 * - sorting           → PreferencesProvider
 * - pageSize          → PreferencesProvider
 * - pageIndex/cursor  → PaginationProvider
 * - data fetching     → useDataFetch
 * - rendering         → Table (this component)
 */

interface GenericTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];

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

  // Optional props
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  enableColumnPinning?: boolean;
  enableColumnResizing?: boolean;
}

export default function Table<TData, TValue>({
  data,
  columns,
  columnVisibility,
  columnSizing,
  columnPinning,
  sorting,
  pageSize,
  onColumnVisibilityChange,
  onColumnSizingChange,
  onColumnPinningChange,
  onSortingChange,
  onRowClick,
  isLoading = false,
  enableColumnPinning = false,
  enableColumnResizing = true,
}: GenericTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // Controlled state - ALL from props
    state: {
      columnVisibility,
      columnSizing,
      columnPinning,
      sorting,
      pagination: {
        pageIndex: 0, // Always 0 - pagination is external
        pageSize,
      },
    },

    // Emit changes to parent (PreferencesProvider)
    onSortingChange: (updater) => {
      const newValue =
        typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(newValue);
    },
    onColumnVisibilityChange: (updater) => {
      const newValue =
        typeof updater === "function" ? updater(columnVisibility) : updater;
      onColumnVisibilityChange(newValue);
    },
    onColumnSizingChange: (updater) => {
      const newValue =
        typeof updater === "function" ? updater(columnSizing) : updater;
      onColumnSizingChange(newValue);
    },
    onColumnPinningChange: (updater) => {
      const newValue =
        typeof updater === "function" ? updater(columnPinning) : updater;
      onColumnPinningChange(newValue);
    },

    // Hard lock pagination - Table does not own pagination
    onPaginationChange: () => {},
    manualPagination: false,

    // Configuration
    columnResizeMode: "onChange" as ColumnResizeMode,
    enableColumnResizing,
    enableColumnPinning,
    defaultColumn: {
      size: 150,
      minSize: 80,
      maxSize: 500,
    },
  });

  return (
    <div className="w-full">
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-white/60 z-20"
          )}
        >
          <SmallLoader showText={false} />
        </div>
      )}

      {table.getRowModel().rows.length === 0 && !isLoading && (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-white/60 z-20 gap-3"
          )}
        >
          <MdOutlineSpaceDashboard className="size-6 text-500" />
          <p className="text-xs text-600">Data Not Found</p>
        </div>
      )}

      <table
        className="w-full border-collapse"
        style={{
          width: table.getCenterTotalSize(),
          tableLayout: "fixed",
        }}
      >
        <TableHead table={table} />
        <TableBody
          table={table}
          onRowClick={onRowClick}
          isLoading={isLoading}
        />
      </table>
    </div>
  );
}
