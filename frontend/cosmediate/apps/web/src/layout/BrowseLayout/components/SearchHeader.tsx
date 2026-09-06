"use client";

import React, { useState } from "react";

import { useFilters, type FilterConfig } from "@cosmediate/browse-manager";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Separator } from "@cosmediate/ui/components/separator";
import { useTranslations } from "@cosmediate/i18n/client";
import type { BrowseMessages } from "@cosmediate/i18n";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

import { LocationSearch } from "@web/components/searchAndFilters/search/LocationSearch";
import { DateTimeSearch } from "@web/components/searchAndFilters/search/DateTimeSearch";
import { SearchInput } from "@web/components/searchAndFilters/search/SearchInput";

import { SlidersHorizontal, ChevronDown } from "lucide-react";

interface SearchHeaderSharedProps {
  searchField: { id: string; placeholder?: string } | undefined;
  pendingFilters: Record<string, { value: unknown }>;
  searchTypeFilters: FilterConfig[];
  pendingSearchQuery: string;
  hasHeaderPendingChanges: boolean;
  updatePendingFilter: (id: string, value: unknown) => void;
  setPendingSearchQuery: (query: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  clearFilter: (id: string) => void;
  clearSearch: () => void;
  onSearch: () => void;
  disabled?: boolean;
}

export const SearchHeader = ({ disabled = false }: { disabled?: boolean }) => {
  const browse = useTranslations("browse");
  const { isMobileView } = useWindowWidth();

  const {
    config,
    pendingSearchQuery,
    setPendingSearchQuery,
    pendingFilters,
    updatePendingFilter,
    applyHeaderFilters,
    clearSearch,
    clearFilter,
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
    if (disabled) return;
    if (e.key === "Enter") {
      applyHeaderFilters();
    }
  };

  const handleSearch = () => {
    if (disabled) return;
    applyHeaderFilters();
  };

  const sharedProps: SearchHeaderSharedProps = {
    searchField: config.searchField,
    searchTypeFilters,
    pendingSearchQuery,
    setPendingSearchQuery,
    pendingFilters,
    updatePendingFilter,
    clearFilter,
    clearSearch,
    hasHeaderPendingChanges: hasHeaderPendingChanges && !disabled,
    onSearch: handleSearch,
    onKeyDown: handleKeyDown,
    disabled,
  };

  if (isMobileView) {
    return <MobileSearchHeader browse={browse} {...sharedProps} />;
  }

  return <DesktopSearchHeader browse={browse} {...sharedProps} />;
};

const SearchTypeFilter = ({
  filter,
  showSeparator,
  pendingFilters,
  updatePendingFilter,
  clearFilter,
  disabled = false,
  browse,
}: {
  filter: FilterConfig;
  showSeparator: boolean;
  pendingFilters: Record<string, { value: unknown }>;
  updatePendingFilter: (id: string, value: unknown) => void;
  clearFilter: (id: string) => void;
  disabled?: boolean;
  browse: BrowseMessages;
}) => {
  switch (filter.type) {
    case "datetime":
      return (
        <div
          key={filter.id}
          className="w-full col-span-1 h-14 max-sm:h-12 flex items-center justify-center bg-white max-sm:rounded-xl"
        >
          <DateTimeSearch
            config={{
              type: "datetime",
              id: filter.id,
              allowMultipleDates: true,
              allowTimeRange: true,
            }}
            value={pendingFilters[filter.id]?.value || {}}
            onChange={(value) => updatePendingFilter(filter.id, value)}
            onClear={() => clearFilter(filter.id)}
            className="w-full h-full px-4 max-sm:rounded-xl"
            disabled={disabled || filter.disabled}
          />
          {showSeparator && (
            <Separator
              orientation="vertical"
              className="h-full max-sm:hidden"
            />
          )}
        </div>
      );

    case "location":
      return (
        <div
          key={filter.id}
          className="w-full col-span-1 h-14 max-sm:h-12 flex items-center justify-center bg-white max-sm:rounded-xl"
        >
          <LocationSearch
            config={{
              type: "location",
              id: filter.id,
              placeholder: filter.placeholder || browse.search.location,
            }}
            value={String(pendingFilters[filter.id]?.value || "")}
            onChange={(value) => updatePendingFilter(filter.id, value)}
            onClear={() => clearFilter(filter.id)}
            disabled={disabled || filter.disabled}
            className="w-full h-full px-4 max-sm:rounded-xl hover:bg-cloud/70"
          />
          {showSeparator && (
            <Separator
              orientation="vertical"
              className="h-full max-sm:hidden"
            />
          )}
        </div>
      );

    default:
      return null;
  }
};

const DesktopSearchHeader = ({
  searchField,
  searchTypeFilters,
  pendingSearchQuery,
  setPendingSearchQuery,
  pendingFilters,
  hasHeaderPendingChanges,
  updatePendingFilter,
  clearFilter,
  clearSearch,
  onSearch,
  onKeyDown,
  disabled = false,
  browse,
}: SearchHeaderSharedProps & {
  browse: BrowseMessages;
}) => (
  <div
    className={cn(
      "w-full grid items-center justify-center",
      "lg:grid-cols-[repeat(4,1fr)_125px] max-lg:grid-cols-[repeat(3,1fr)_100px]",
      "bg-white rounded-xl overflow-hidden",
    )}
  >
    {searchField && (
      <div
        className={cn(
          "w-full h-14 flex items-center justify-center bg-white",
          searchTypeFilters.length === 2 && "lg:col-span-2",
          searchTypeFilters.length === 1 && "lg:col-span-3",
          searchTypeFilters.length === 0 && "lg:col-span-4 max-lg:col-span-3",
        )}
      >
        <SearchInput
          config={{
            type: "input",
            id: searchField.id,
            placeholder: searchField.placeholder || browse.search.placeholder,
          }}
          value={pendingSearchQuery}
          onChange={setPendingSearchQuery}
          onKeyDown={onKeyDown}
          onClear={clearSearch}
          className="w-full h-full flex items-center justify-center px-4"
          disabled={disabled}
        />
        <Separator orientation="vertical" className="h-full" />
      </div>
    )}

    {searchTypeFilters.map((filter, index) => (
      <SearchTypeFilter
        key={filter.id}
        filter={filter}
        showSeparator={index < searchTypeFilters.length - 1}
        pendingFilters={pendingFilters}
        updatePendingFilter={updatePendingFilter}
        clearFilter={clearFilter}
        disabled={disabled}
        browse={browse}
      />
    ))}

    <Button
      disabled={!hasHeaderPendingChanges || disabled}
      onClick={onSearch}
      className="h-full min-h-14 w-full bg-black hover:bg-black/80 text-white rounded-none"
    >
      {browse.search.submit}
    </Button>
  </div>
);

const MobileSearchHeader = ({
  searchField,
  searchTypeFilters,
  pendingSearchQuery,
  setPendingSearchQuery,
  pendingFilters,
  hasHeaderPendingChanges,
  updatePendingFilter,
  clearFilter,
  clearSearch,
  onSearch,
  onKeyDown,
  disabled = false,
  browse,
}: SearchHeaderSharedProps & {
  browse: BrowseMessages;
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasFilters = searchTypeFilters.length > 0;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Row 1: Search input + Filter button */}
      <div className="w-full grid grid-cols-[1fr_auto] gap-2">
        {searchField && (
          <div className="w-full h-12 flex items-center justify-center bg-white rounded-xl">
            <SearchInput
              config={{
                type: "input",
                id: searchField.id,
                placeholder:
                  searchField.placeholder || browse.search.placeholder,
              }}
              value={pendingSearchQuery}
              onChange={setPendingSearchQuery}
              onKeyDown={onKeyDown}
              onClear={clearSearch}
              className="w-full h-full flex items-center justify-center px-4 rounded-xl"
              disabled={disabled}
            />
          </div>
        )}

        {hasFilters && (
          <Button
            variant="outline"
            onClick={() => setFiltersOpen((prev) => !prev)}
            disabled={disabled}
            className="h-12 bg-white border-0 rounded-xl flex items-center gap-2 px-4"
          >
            <SlidersHorizontal className="size-4 text-500" />
            <ChevronDown
              className={cn(
                "size-4 text-400 transition-transform duration-200",
                filtersOpen && "rotate-180",
              )}
            />
          </Button>
        )}
      </div>

      {/* Collapsible filters panel */}
      {hasFilters && (
        <div
          className={cn(
            "grid grid-cols-1 gap-2 overflow-hidden transition-all duration-300 ease-in-out",
            filtersOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {searchTypeFilters.map((filter, index) => (
            <SearchTypeFilter
              key={filter.id}
              filter={filter}
              showSeparator={index < searchTypeFilters.length - 1}
              pendingFilters={pendingFilters}
              updatePendingFilter={updatePendingFilter}
              clearFilter={clearFilter}
              disabled={disabled}
              browse={browse}
            />
          ))}
        </div>
      )}

      <Button
        disabled={!hasHeaderPendingChanges || disabled}
        onClick={onSearch}
        className="h-12 w-full bg-black hover:bg-black/80 text-white rounded-xl"
      >
        {browse.search.submit}
      </Button>
    </div>
  );
};
