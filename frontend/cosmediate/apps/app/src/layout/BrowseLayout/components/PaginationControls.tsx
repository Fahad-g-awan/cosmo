import React from "react";

import { Button } from "@cosmediate/ui/components/button";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  onNext: () => void;
  onPrevious: () => void;
  itemsPerPage: number;
  paginationMode?: "cursor" | "offset";
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  isLoading,
  onNext,
  onPrevious,
  itemsPerPage,
  paginationMode = "offset",
}) => {
  const isCursorMode = paginationMode === "cursor";
  const actualItems = Math.min(
    itemsPerPage,
    totalCount - currentPage * itemsPerPage,
  );

  const startItem = totalCount > 0 ? currentPage * itemsPerPage + 1 : 0;
  const endItem = isCursorMode
    ? startItem + (itemsPerPage - 1)
    : startItem + actualItems - 1;

  if (totalCount === 0 && !hasNextPage && !hasPreviousPage) return null;

  return (
    <div className="w-full flex items-center justify-between py-4 border-t mt-4">
      <div className="text-xs text-500">
        {isCursorMode ? (
          <>
            Page <span className="font-medium">{currentPage + 1}</span>
            {totalCount > 0 && (
              <>
                {" "}
                · <span className="font-medium">{totalCount}</span> loaded
              </>
            )}
          </>
        ) : totalCount > 0 ? (
          <>
            Showing <span className="font-medium">{startItem}</span> -{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalCount}</span> results
          </>
        ) : (
          "No results"
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPreviousPage || isLoading}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* <span className="text-sm text-600 px-2">
          Page {currentPage + 1} {totalPages > 0 && `of ${totalPages}`}
        </span> */}

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNextPage || isLoading}
          className="flex items-center gap-1"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
