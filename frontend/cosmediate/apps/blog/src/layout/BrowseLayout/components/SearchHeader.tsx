"use client";

import React from "react";

import { Separator } from "@cosmediate/ui/components/separator";
import { useTranslations } from "@cosmediate/i18n/client";
import { useFilters } from "@cosmediate/browse-manager";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

import { SearchInput } from "@blog/components/searchAndFilters/search/SearchInput";

export const SearchHeader = () => {
  const browse = useTranslations("browse");
  const {
    config,
    pendingSearchQuery,
    setPendingSearchQuery,
    applyHeaderFilters,
    clearSearch,
    hasHeaderPendingChanges,
  } = useFilters();

  if (!config?.filters) return null;

  // Separate search-type filters (location, datetime) from regular filters
  const searchTypeFilters = config.filters.filter(
    (f) => f.type === "location" || f.type === "datetime",
  );

  const hasSearchTypeFilters = searchTypeFilters.length > 0;
  const hasSearchField = config.searchField !== undefined;

  if (!hasSearchField && !hasSearchTypeFilters) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyHeaderFilters();
    }
  };

  const handleSearch = () => {
    applyHeaderFilters();
  };

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center",
        "bg-white rounded-xl overflow-hidden",
      )}
    >
      {config.searchField && (
        <div className="w-full h-14 flex items-center justify-center bg-white lg:col-span-2">
          <SearchInput
            config={{
              type: "input",
              id: config.searchField.id,
              placeholder:
                config.searchField.placeholder || browse.search.placeholder,
            }}
            value={pendingSearchQuery}
            onChange={setPendingSearchQuery}
            onKeyDown={handleKeyDown}
            onClear={clearSearch}
            className="w-full h-full flex items-center justify-center px-4"
          />
          <Separator orientation="vertical" className="h-full" />
        </div>
      )}

      <Button
        disabled={!hasHeaderPendingChanges}
        onClick={handleSearch}
        className="w-[125px] max-sm:w-[70px] h-full min-h-14 bg-black hover:bg-black/80 text-white rounded-none"
      >
        {browse.search.submit}
      </Button>
    </div>
  );
};
