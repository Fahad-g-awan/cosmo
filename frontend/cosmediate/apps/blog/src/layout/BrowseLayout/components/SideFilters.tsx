"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { useFilters } from "@cosmediate/browse-manager";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

import { CheckboxFilter } from "@blog/components/searchAndFilters/filters/CheckboxFilter";
import { RangeBarFilter } from "@blog/components/searchAndFilters/filters/RangeBarFilter";
import { RangeFilter } from "@blog/components/searchAndFilters/filters/RangeFilter";
import { RangeDateFilter } from "@blog/components/searchAndFilters/filters/RangeDateFilter";
import { RadioFilter } from "@blog/components/searchAndFilters/filters/RadioFilter";

interface SideFiltersProps {
  isLoading?: boolean;
}

export const SideFilters = ({ isLoading = false }: SideFiltersProps) => {
  const browse = useTranslations("browse");
  const {
    config,
    pendingFilters,
    updatePendingFilter,
    applySidebarFilters,
    clearSidebarFilters,
    hasSidebarPendingChanges,
    hasSidebarActiveFilters,
  } = useFilters();

  if (!config?.filters) return null;

  // Filter out search-type filters (location, datetime) - those go in SearchHeader
  const sidebarFilters = config.filters.filter(
    (f) => f.type !== "location" && f.type !== "datetime",
  );

  if (sidebarFilters.length === 0) return null;

  const handleFilterChange = (filterId: string, newValue: unknown) => {
    if (filterId === "publishedAt") {
      const hasRange =
        Array.isArray(newValue) && Boolean(newValue[0] || newValue[1]);
      if (hasRange) {
        updatePendingFilter("publishedMonth", "");
        updatePendingFilter("publishedYear", "");
      }
    } else if (filterId === "publishedMonth" || filterId === "publishedYear") {
      if (newValue && newValue !== "") {
        updatePendingFilter("publishedAt", [null, null]);
      }
    }

    updatePendingFilter(filterId, newValue);
  };

  const renderFilter = (filter: (typeof sidebarFilters)[0]) => {
    const value = pendingFilters[filter.id]?.value;

    switch (filter.type) {
      case "range-bar":
        return (
          <RangeBarFilter
            key={filter.id}
            config={{
              type: "range-bar",
              id: filter.id,
              label: filter.label,
              min: filter.min || 0,
              max: filter.max || 100,
              step: filter.step || 1,
              binCount: filter.binCount || 10,
              defaultValue: (filter.defaultValue as [number, number]) || [
                0, 100,
              ],
            }}
            histograms={filter.histograms}
            value={
              (value as [number, number]) ||
              (filter.defaultValue as [number, number]) || [0, 100]
            }
            onChange={(newValue) => handleFilterChange(filter.id, newValue)}
          />
        );

      case "range-slider":
        return (
          <RangeFilter
            key={filter.id}
            config={{
              type: "range",
              id: filter.id,
              label: filter.label,
              min: filter.min || 0,
              max: filter.max || 100,
              step: filter.step || 1,
              defaultValue: (filter.defaultValue as [number, number]) || [
                0, 100,
              ],
            }}
            value={
              (value as [number, number]) ||
              (filter.defaultValue as [number, number]) || [0, 100]
            }
            onChange={(newValue) => handleFilterChange(filter.id, newValue)}
          />
        );

      case "range-date":
        return (
          <RangeDateFilter
            key={filter.id}
            config={{
              id: filter.id,
              label: filter.label,
              defaultValue: (filter.defaultValue as [
                Date | null,
                Date | null,
              ]) || [null, null],
            }}
            value={
              (value as [Date | null, Date | null]) ||
              (filter.defaultValue as [Date | null, Date | null]) || [
                null,
                null,
              ]
            }
            onChange={(newValue) => handleFilterChange(filter.id, newValue)}
          />
        );

      case "checkbox":
      case "multiselect":
        return (
          <CheckboxFilter
            key={filter.id}
            config={{
              type: "checkbox",
              id: filter.id,
              label: filter.label,
              options:
                filter.options?.map((o) => ({
                  label: o.label,
                  value: o.value,
                })) || [],
              defaultValue: (filter.defaultValue as string[]) || [],
            }}
            value={
              Array.isArray(value) ? value : (filter.defaultValue as string[])
            }
            onChange={(newValue) => handleFilterChange(filter.id, newValue)}
            isLoading={isLoading}
          />
        );

      case "radio":
      case "select":
        return (
          <RadioFilter
            key={filter.id}
            config={{
              type: "radio",
              id: filter.id,
              label: filter.label,
              options:
                filter.options?.map((o) => ({
                  label: o.label,
                  value: o.value,
                })) || [],
              defaultValue: (filter.defaultValue as string) || "",
            }}
            value={
              typeof value === "string"
                ? value
                : (filter.defaultValue as string)
            }
            onChange={(newValue) => handleFilterChange(filter.id, newValue)}
          />
        );

      // case "distance":
      //   // These use checkbox-like UI for multiple selection
      //   return (
      //     <CheckboxFilter
      //       key={filter.id}
      //       config={{
      //         type: "checkbox",
      //         id: filter.id,
      //         label: filter.label,
      //         options:
      //           filter.options?.map((o) => ({
      //             label: o.label,
      //             value: o.value,
      //           })) || [],
      //         defaultValue: (filter.defaultValue as string[]) || [],
      //       }}
      //       value={
      //         Array.isArray(value) ? value : (filter.defaultValue as string[])
      //       }
      //       onChange={(newValue) => updatePendingFilter(filter.id, newValue)}
      //       isLoading={isLoading}
      //     />
      //   );

      default:
        return null;
    }
  };

  const canApplySidebar = hasSidebarPendingChanges;
  const canClearSidebar = hasSidebarActiveFilters || hasSidebarPendingChanges;

  return (
    <div className="w-full flex flex-col items-start justify-start gap-7">
      <div
        className={cn(
          "w-full flex flex-col items-start justify-start gap-7",
          "max-lg:px-3",
        )}
      >
        {sidebarFilters.map((filter) => renderFilter(filter))}
      </div>

      {/* Filter action buttons */}
      <div className="w-full sticky bottom-0 z-40 pt-4 bg-white grid grid-cols-2 items-center justify-center gap-2 max-lg:hidden">
        <Button
          disabled={!canClearSidebar}
          onClick={clearSidebarFilters}
          variant="outline"
          className="w-full text-sm"
        >
          {browse.filters.clearAll}
        </Button>
        <Button
          onClick={applySidebarFilters}
          disabled={!canApplySidebar}
          className="w-full text-sm"
        >
          {browse.filters.apply}
        </Button>
      </div>
    </div>
  );
};
