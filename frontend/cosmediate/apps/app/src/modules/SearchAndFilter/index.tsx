import React, { useCallback } from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { FiFilter } from "react-icons/fi";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { SearchComp } from "./Filters/Search";
import { useFilters } from "@cosmediate/browse-manager";

interface SearchAndFilterProps {
  showSearch?: boolean;
}

const SearchAndFilter = ({ showSearch = true }: SearchAndFilterProps) => {
  const { openDialog } = useDialog();

  const filtersContext = useFilters();

  const handleFilterClick = useCallback(() => {
    openDialog({
      dialogType: "browse-filters",
      payload: {
        title: "Filters",
        cancelLabel: "Clear",
        confirmLabel: "Apply",
        closeOnConfirm: false,
        onConfirm: filtersContext.applyFilters,
        onCancel: filtersContext.clearFilters,
      },
    });
  }, [openDialog, filtersContext]);

  return (
    <div className="w-full space-y-2">
      <div
        className={cn(
          "w-full flex items-center justify-center",
          "border focus-within:border-primary-accent rounded-lg",
        )}
      >
        {showSearch && (
          <SearchComp
            searchQuery={filtersContext.searchQuery}
            setSearchQuery={filtersContext.setSearchQuery}
            setPendingSearchQuery={filtersContext.setPendingSearchQuery}
            pendingSearchQuery={filtersContext.pendingSearchQuery}
            searchPlaceholder={
              filtersContext.config?.searchField?.placeholder ?? "Search..."
            }
          />
        )}

        <div className={cn("w-[50px] flex items-center justify-center p-2")}>
          <FiFilter
            className={cn(
              "size-4 cursor-pointer transition-colors",
              "text-400",
            )}
            onClick={handleFilterClick}
            title="Open filters"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
