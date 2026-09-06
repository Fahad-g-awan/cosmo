"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

import { useTranslations } from "@cosmediate/i18n/client";
import { Button } from "@cosmediate/ui/components/button";
import { cn } from "@cosmediate/ui/lib/utils";

import { LocationSearch } from "@web/components/searchAndFilters/search/LocationSearch";
import { DateTimeSearch } from "@web/components/searchAndFilters/search/DateTimeSearch";
import { SearchInput } from "@web/components/searchAndFilters/search/SearchInput";

const SearchCardContent = ({
  activeTab,
  path,
  className,
  placeholder,
  disableLocation = false,
}: {
  activeTab: string;
  path: string;
  className: string;
  placeholder: string;
  disableLocation?: boolean;
}) => {
  const search = useTranslations("marketing").home.search;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const urlPath = useMemo(() => {
    const params = new URLSearchParams();

    if (searchQuery?.trim()) params.set("query", searchQuery);
    if (location?.trim()) params.set("location", location);

    return `${path}?${params.toString()}`;
  }, [searchQuery, location, path]);

  return (
    <div className={cn("w-full p-4 bg-white", className)}>
      <div className="flex flex-col gap-3 items-center w-full">
        <SearchInput
          config={{
            id: "input",
            type: "input",
            placeholder: placeholder,
          }}
          onChange={(value: string) => setSearchQuery(value)}
          onClear={() => setSearchQuery("")}
          value={searchQuery}
          className="h-12 border border-stroke px-4 py-3.5 rounded-[12px]"
        />

        <DateTimeSearch
          placeholder={search.placeholders.dateTime}
          className="h-12 border border-stroke px-4 py-3.5 rounded-[12px]"
        />

        <div className="flex max-sm:flex-col justify-center gap-2 w-full">
          <LocationSearch
            config={{
              id: "location",
              type: "location",
              placeholder: search.placeholders.location,
            }}
            onChange={(value: string) => setLocation(value)}
            onClear={() => setLocation("")}
            value={location}
            disabled={disableLocation}
            className="h-12 border border-stroke px-4 py-3.5 rounded-[12px]"
          />

          <Button
            variant="default"
            type="button"
            className={cn(
              "w-30 h-12 p-0 max-xl:h-9 max-lg:h-11 max-xl:text-xs max-xl:w-20 max-lg:w-30 max-sm:w-full",
            )}
            disabled={disableLocation ? false : !searchQuery && !location}
          >
            <Link
              href={urlPath}
              className="h-full w-full flex items-center justify-center"
            >
              {search.searchButton}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchCardContent;
