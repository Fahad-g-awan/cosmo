"use client";

import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  SmallLoader,
  ToggleMenu,
} from "@cosmediate/ui";
import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import type { ViewModes } from "@cosmediate/browse-manager";
import { cn } from "@cosmediate/ui/lib/utils";
import { useTranslations } from "@cosmediate/i18n/client";
import type { NavMessages, ProfileMessages } from "@cosmediate/i18n";

import { CiCircleList } from "react-icons/ci";
import { LuLayoutGrid } from "react-icons/lu";
import { FiFilter } from "react-icons/fi";

const resolveScopeTitle = (
  scope: string,
  nav: NavMessages,
  profile: ProfileMessages,
) => {
  if (scope.includes("detail")) {
    const segment = scope.split(":")[3];
    switch (segment) {
      case "doctors":
        return profile.tabs.doctors;
      case "treatments":
        return profile.tabs.treatments;
      case "clinics":
        return profile.tabs.clinics;
      default:
        return segment ?? scope;
    }
  }

  switch (scope) {
    case "clinics":
      return nav.clinics;
    case "specialists":
      return nav.specialists;
    case "treatments":
      return nav.treatments;
    default:
      return scope;
  }
};

export const ControlBar = () => {
  const profile = useTranslations("profile");
  const browse = useTranslations("browse");
  const nav = useTranslations("nav");
  const {
    config,
    isInitialized,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    updateSort,
  } = usePreferences();
  const { totalCount, isLoading } = usePagination();
  const { toggleMobileFilters } = useFilters();

  const handleSortChange = (value: string) => {
    const option = sortOptions.find((opt) => opt.value === value);
    if (option) {
      updateSort(option.sortBy, option.order);
    }
  };

  // Don't render until preferences are initialized
  if (!isInitialized || !config) {
    return null;
  }

  const sortOptions = config.sortOptions || [];
  const showViewToggle = config.viewModes && config.viewModes.length > 1;

  const currentSortValue =
    sortOptions.find((opt) => opt.sortBy === sortBy && opt.order === sortOrder)
      ?.value ||
    sortOptions[0]?.value ||
    "";

  const title = resolveScopeTitle(config.scope, nav, profile);

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between",
        "max-sm:flex-col max-sm:gap-2",
      )}
    >
      <div className="w-full flex items-center justify-start gap-6">
        {/* Results count */}
        <div className="text-sm text-600">
          {isLoading ? (
            <SmallLoader showText={false} spinnerClassName="w-7 h-7" />
          ) : (
            <span className="flex items-center gap-2 capitalize text-900 text-3xl leading-9 font-bold max-sm:text-xl max-sm:leading-5">
              {title}
              <span className="">({totalCount})</span>
            </span>
          )}
        </div>

        {/* Sort dropdown */}
        {sortOptions.length > 0 && (
          <Select value={currentSortValue} onValueChange={handleSortChange}>
            <SelectTrigger
              className={cn(
                "w-auto min-w-32 border-none shadow-none data-placeholder:text-700 hover:text-900 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-cloud/80 rounded-lg cursor-pointer transition-all duration-300",
                isLoading && "pointer-events-none opacity-60",
              )}
            >
              <SelectValue
                placeholder={browse.sort.placeholder}
                className="text-sm text-700"
              />
            </SelectTrigger>

            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs text-700 cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="w-full flex items-center justify-end max-sm:justify-between gap-3">
        {/* View toggle */}
        {showViewToggle && (
          <ToggleMenu
            items={[
              {
                value: "grid",
                label: browse.view.grid,
                icon: (
                  <LuLayoutGrid className="size-4 text-800" strokeWidth={2.2} />
                ),
              },
              {
                value: "list",
                label: browse.view.list,
                icon: (
                  <CiCircleList
                    className="w-4.5 h-4.5 text-800"
                    strokeWidth={1.2}
                  />
                ),
              },
            ]}
            value={viewMode}
            onChange={(value: ViewModes) => setViewMode(value)}
            className="w-[160px]"
          />
        )}

        {/* Mobile filter toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobileFilters}
          className="lg:hidden text-primary-accent/90 hover:text-primary-accent"
        >
          <FiFilter className="size-5" />
        </Button>
      </div>
    </div>
  );
};
