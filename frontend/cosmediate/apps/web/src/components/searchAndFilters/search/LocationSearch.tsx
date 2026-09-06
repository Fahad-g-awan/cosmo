"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  SmallLoader,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useTranslations } from "@cosmediate/i18n/client";

import { fetchPlaces } from "@web/services/places.api";
import { LocationSearchConfig } from "../types";
import { truncateText } from "@web/lib/utils";

import {
  ChevronDown,
  MapPin,
  MapPinned,
  MapPinOff,
  Search,
  X,
} from "lucide-react";

interface LocationSearchProps {
  config?: LocationSearchConfig;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
  disabled?: boolean;
}

export const LocationSearch = ({
  config,
  value,
  onChange,
  onClear,
  className,
  disabled = false,
}: LocationSearchProps) => {
  const browse = useTranslations("browse");
  const [locationSearchError, setLocationSearchError] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (location: string) => {
    onChange(location);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    setLocationSearchError("");
    e.stopPropagation();
    setSearchQuery("");
    setSuggestions([]);
    onClear();
  };

  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "";
  //   }
  // }, [isOpen]);

  const handleLocationSearch = useCallback(async () => {
    try {
      const results = await fetchPlaces(searchQuery);

      if (results && results?.length > 0) {
        const suggestions = results.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (place: any) => `${place.name}, ${place.address}`
        );
        setSuggestions(suggestions);
      }
    } catch (error) {
      console.log("[handleLocationSearch] Error:", error);
      setLocationSearchError(browse.search.locationError);
    }

    setIsSearching(false);
  }, [searchQuery, browse.search.locationError]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (searchQuery) {
      timeout = setTimeout(() => {
        handleLocationSearch();
      }, 300);
    } else if (!searchQuery) {
      setIsSearching(false);
      setSuggestions([]);
    }

    return () => clearTimeout(timeout);
  }, [searchQuery, handleLocationSearch]);

  /**
   * Helper variables to determine what to show
   */
  const initialMessage =
    !locationSearchError &&
    !searchQuery &&
    !isSearching &&
    suggestions.length === 0;
  const showLoader = !locationSearchError && searchQuery && isSearching;
  const showErrorMessage =
    (locationSearchError || suggestions?.length === 0) &&
    searchQuery &&
    !isSearching;
  const showResults = suggestions?.length > 0 && !isSearching;

  if (disabled) {
    return (
      <div
        className={cn(
          "w-full flex items-center justify-between gap-2",
          "text-400 text-sm leading-[18px]",
          "max-xl:h-9 max-lg:h-11 max-xl:text-xs",
          "pointer-events-none opacity-50",
          className,
        )}
      >
        <div className="w-full flex items-center justify-start gap-3">
          <MapPin className="size-4 text-800" />
          <span>{config?.placeholder || browse.search.location}</span>
        </div>
        <ChevronDown className="size-5 text-300" />
      </div>
    );
  }

  return (
    <>
      {isOpen &&
        createPortal(
          <div
            className={cn("fixed inset-0 bg-black/20 z-40")}
            onClick={() => setIsOpen(false)}
          />,
          document.body
        )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "w-full flex items-center justify-between gap-2 text-sm leading-[18px] cursor-pointer",
              value ? "text-900" : "text-400",
              "hover:bg-ghost-blue-2 transition-colors duration-200",
              "max-xl:h-9 max-lg:h-11 max-xl:text-xs",
              className
            )}
          >
            <div className="w-full flex items-center justify-start gap-3">
              <MapPin className="size-4 text-800" />
              <span>
                {truncateText(value, 25) ||
                  config?.placeholder ||
                  browse.search.cityOrPostal}
              </span>
            </div>

            <div className="w-[20%] flex items-center justify-end gap-3">
              {value && (
                <X
                  onClick={handleClear}
                  className="w-4 h-4 text-300 hover:text-danger transition-all duration-200 cursor-pointer"
                />
              )}
              <ChevronDown
                className={cn(
                  "size-5 text-300",
                  isOpen ? "rotate-180" : "rotate-0",
                  "transition-all duration-200"
                )}
              />
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-85 max-[400px]:w-70 p-5 pt-0 rounded-2xl mt-5 shadow-none outline-none border-none"
          align="end"
          // side="bottom"
          avoidCollisions={false}
        >
          {/* Pointer */}
          <div className="size-5 bg-white rotate-45 -translate-y-[10px] translate-x-[17rem] max-[400px]:translate-x-[12rem]"></div>

          {/* Content */}
          <div
            className={cn(
              "w-full h-12 flex items-center justify-between gap-3 px-4 py-3.5 rounded-[12px]",
              "text-400 text-sm leading-[18px]",
              "border border-stroke",
              "max-xl:h-9 max-lg:h-11 max-xl:text-xs"
            )}
          >
            <Search className="size-5 text-800" />
            <Input
              type="text"
              placeholder={browse.search.locationInputPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setIsSearching(true);
                setSearchQuery(e.target.value);
              }}
              // onKeyDown={(e) => {
              //   if (e.key === "Enter" && searchQuery) {
              //     handleSelect(searchQuery);
              //   }
              // }}
              className={cn(
                "w-full border-none hover:border-none p-0 placeholder:text-400"
              )}
              autoFocus
            />
            <div className="w-[10%] flex items-center justify-center">
              {searchQuery && (
                <X
                  onClick={() => setSearchQuery("")}
                  className="w-4 h-4 text-600 hover:text-danger transition-all duration-200 cursor-pointer"
                />
              )}
            </div>
          </div>

          <div>
            {/* No content message */}
            {showErrorMessage && (
              <div className="w-full my-10 flex flex-col items-center justify-center gap-3">
                <MapPinOff className="size-5 text-700" />
                <span className="text-center text-600 text-sm">
                  {locationSearchError || browse.search.locationNoResults}
                </span>
              </div>
            )}

            {/* Initial UI */}
            {initialMessage && (
              <div className="w-full h-full my-10 flex flex-col items-center justify-center gap-3">
                <MapPinned className="size-8 text-300" strokeWidth={1.5} />
                <span className="text-center text-400 text-sm font-medium">
                  {browse.search.locationHint}
                </span>
              </div>
            )}

            {/* Loader while searching */}
            {showLoader && <SmallLoader showText={false} className="my-10" />}

            {/* Search results */}
            {showResults && (
              <div className="w-full mt-4 h-60 overflow-y-auto">
                {suggestions.map((location: string) => (
                  <div
                    key={location}
                    onClick={() => handleSelect(location)}
                    className="text-sm text-800 leading-[18px] p-4 rounded-xl hover:bg-cloud transition-all duration-200 cursor-pointer"
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
