"use client";

import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cosmediate/ui";
import { usePagination, usePreferences } from "@cosmediate/browse-manager";
import { useTranslations } from "@cosmediate/i18n/client";
import { Button, Separator } from "@cosmediate/ui";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  showItemCount?: boolean;
  onNext: () => Promise<void>;
  onPrevious: () => void;
}

export const Pagination = ({
  showItemCount = true,
  onNext,
  onPrevious,
}: PaginationProps) => {
  const browse = useTranslations("browse");
  const {
    currentIndex,
    hasNextPage,
    hasPreviousPage,
    totalCount,
    items,
    isLoading,
  } = usePagination();
  const { isInitialized, itemsPerPage, setItemsPerPage } = usePreferences();

  // Don't render until initialized or if no items
  if (!isInitialized || totalCount === 0 || items.length === 0) {
    return null;
  }

  const startItem = currentIndex * itemsPerPage + 1;
  const endItem = Math.min(startItem + items.length - 1, totalCount);

  const itemsPerPageOptions = [4, 8, 12, 16, 20];

  return (
    <div className="w-full flex flex-wrap items-center justify-end gap-3 lg:flex-nowrap">
      <div className="max-sm:w-full flex items-center justify-center gap-3">
        {showItemCount && totalCount !== undefined && (
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            <span className="max-sm:hidden">{browse.pagination.showing}</span>{" "}
            {startItem} - {endItem} {browse.pagination.of} {totalCount}{" "}
            {browse.pagination.records}
          </span>
        )}

        <Separator orientation="vertical" className="h-5 shrink-0" />

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            <span className="max-sm:hidden">{browse.pagination.records}</span>{" "}
            {browse.pagination.perPage}:
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-17.5 !h-7 py-0 !text-xs cursor-pointer hover:bg-cloud/80">
              <SelectValue className="py-0" />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem
                  className="text-xs"
                  key={option}
                  value={option.toString()}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator
        orientation="vertical"
        className="h-5 shrink-0 hidden lg:block"
      />

      <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPreviousPage || isLoading}
          className="px-3 min-w-20 max-sm:flex-1"
        >
          <ChevronLeft className="size-5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNextPage || isLoading}
          className="px-3 min-w-20 max-sm:flex-1"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
};
