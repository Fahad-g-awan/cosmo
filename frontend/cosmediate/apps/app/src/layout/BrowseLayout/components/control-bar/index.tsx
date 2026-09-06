import type { ColumnDef } from "@tanstack/react-table";
import React, { useCallback, useState } from "react";

import { usePagination, usePreferences } from "@cosmediate/browse-manager";
import {
  ButtonLoader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ToggleMenu,
} from "@cosmediate/ui";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Button } from "@cosmediate/ui/components/button";

import { ColumnToggleSection } from "./ColumnToggleSection";
import { PageSizeSelectSection } from "./PageSizeSelectSection";
import { SortSelectSection } from "./SortSelectSection";
import { useRefreshCooldown } from "./useRefreshCooldown";

import { LayoutGrid, RefreshCw, Settings2, Table } from "lucide-react";

interface ControlBarProps<T> {
  viewMode: "table" | "grid" | "list";
  onViewModeChange: (mode: "table" | "grid" | "list") => void;
  totalCount?: number;
  showItemCount?: boolean;
  columns?: ColumnDef<T>[];
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  showViewModeToggle?: boolean;
  hideColumnSelector?: boolean;
  showRefreshButton?: boolean;
}

const MENU_SEPARATOR_CLASS = "my-2 bg-100";

export const ControlBar = <T,>({
  viewMode,
  onViewModeChange,
  columns = [],
  columnVisibility,
  onColumnVisibilityChange,
  pageSize,
  onPageSizeChange,
  showViewModeToggle = true,
  hideColumnSelector = false,
  showRefreshButton = true,
}: ControlBarProps<T>) => {
  const { isMobileView, isTabletView } = useWindowWidth();
  const { config, isInitialized, sortBy, sortOrder, updateSort } =
    usePreferences();
  const { isLoading, refetch } = usePagination();
  const { isCooldown, secondsLeft, startCooldown } = useRefreshCooldown();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isCooldown || isRefreshing) return;

    setIsRefreshing(true);
    startCooldown();

    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isCooldown, isRefreshing, refetch, startCooldown]);

  const sortOptions = config?.sortOptions ?? [];
  const currentSortValue =
    sortOptions.find((opt) => opt.sortBy === sortBy && opt.order === sortOrder)
      ?.value ||
    sortOptions[0]?.value ||
    "";

  const handleSortChange = (value: string) => {
    const option = sortOptions.find((opt) => opt.value === value);
    if (option) {
      updateSort(option.sortBy, option.order);
    }
  };

  const showColumnToggle =
    viewMode === "table" && !hideColumnSelector && columns.length > 0;
  const hasSortOptions = isInitialized && sortOptions.length > 0;

  const showSettings =
    viewMode === "table"
      ? showColumnToggle || !hideColumnSelector || hasSortOptions
      : true;

  const showToggle = showViewModeToggle && !isMobileView && !isTabletView;

  return (
    <div className="flex items-center justify-end gap-2 w-full">
      {showToggle && (
        <div className="w-[170px]">
          <ToggleMenu
            items={[
              {
                label: `Table`,
                value: "table",
                icon: <Table className="size-4" />,
              },
              {
                label: `Grid`,
                value: "grid",
                icon: <LayoutGrid className="size-4" />,
              },
            ]}
            value={viewMode}
            onChange={(value) => onViewModeChange(value)}
            className="w-full"
          />
        </div>
      )}

      {showRefreshButton && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={
            isCooldown && secondsLeft > 0
              ? `Refresh available in ${secondsLeft} seconds`
              : "Refresh list"
          }
          title={
            isCooldown && secondsLeft > 0
              ? `Refresh in ${secondsLeft}s`
              : "Refresh list"
          }
          disabled={isCooldown || isRefreshing}
          onClick={handleRefresh}
        >
          {isRefreshing ? (
            <ButtonLoader variant="light" className="size-4" />
          ) : isCooldown && secondsLeft > 0 ? (
            <span className="text-xs font-semibold tabular-nums leading-none">
              {secondsLeft}
            </span>
          ) : (
            <RefreshCw className="size-4" />
          )}
        </Button>
      )}

      {showSettings && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild className="outline-none shadow-none">
            <Button variant="outline" size="icon">
              <Settings2 className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-lg pb-2">
            {showColumnToggle && (
              <ColumnToggleSection
                columns={columns}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={onColumnVisibilityChange}
              />
            )}

            <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />

            {hasSortOptions && (
              <SortSelectSection
                sortOptions={sortOptions}
                currentSortValue={currentSortValue}
                disabled={isLoading}
                onSortChange={handleSortChange}
              />
            )}

            <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />

            <PageSizeSelectSection
              viewMode={viewMode}
              pageSize={pageSize}
              onPageSizeChange={onPageSizeChange}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
