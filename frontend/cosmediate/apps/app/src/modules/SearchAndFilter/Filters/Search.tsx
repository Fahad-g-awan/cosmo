import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { Input } from "@cosmediate/ui/index";
import { FiX } from "react-icons/fi";

export const SearchComp = ({
  pendingSearchQuery,
  setSearchQuery,
  searchPlaceholder,
  setPendingSearchQuery,
  searchQuery,
}: {
  pendingSearchQuery: string;
  setSearchQuery: (query: string) => void;
  setPendingSearchQuery: (query: string) => void;
  searchQuery: string;
  searchPlaceholder: string;
}) => {
  const handleSearch = () => {
    setSearchQuery(pendingSearchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPendingSearchQuery("");
  };

  // Handle search

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full flex items-center justify-between gap-2">
      <Input
        className={cn(
          "w-full border-none outline-none text-sm max-sm:py-0 max-sm:h-8 pr-0"
        )}
        placeholder={searchPlaceholder}
        value={pendingSearchQuery}
        onChange={(e) => setPendingSearchQuery(e.target.value)}
        onKeyDown={handleSearchKeyPress}
      />

      {/* Clear Search Button */}
      {(searchQuery || pendingSearchQuery) && (
        <FiX
          className={cn(
            "size-4 cursor-pointer transition-colors text-400 hover:text-600"
          )}
          onClick={handleClearSearch}
          title="Clear search"
        />
      )}
    </div>
  );
};
