"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { useFilters } from "@cosmediate/browse-manager";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

import { CheckboxFilter } from "@web/components/searchAndFilters/filters/CheckboxFilter";
import { RangeBarFilter } from "@web/components/searchAndFilters/filters/RangeBarFilter";
import { RangeFilter } from "@web/components/searchAndFilters/filters/RangeFilter";
import { RadioFilter } from "@web/components/searchAndFilters/filters/RadioFilter";
import { PaginatedAsyncBrowseFilter } from "@web/modules/PaginatedAsyncSelect";

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
    userLocation,
    requestUserLocation,
    isRequestingUserLocation,
  } = useFilters();

  if (!config?.filters) return null;

  // Filter out search-type filters (location, datetime) - those go in SearchHeader
  const sidebarFilters = config.filters.filter(
    (f) => f.type !== "location" && f.type !== "datetime",
  );

  if (sidebarFilters.length === 0) return null;

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
              binCount: filter.binCount || 30,
              defaultValue: (filter.defaultValue as [number, number]) || [
                0, 100,
              ],
            }}
            histograms={filter.histograms}
            value={
              (value as [number, number]) ||
              (filter.defaultValue as [number, number]) || [0, 100]
            }
            onChange={(newValue) => updatePendingFilter(filter.id, newValue)}
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
            onChange={(newValue) => updatePendingFilter(filter.id, newValue)}
            locationAccess={
              config.enableGeolocation && filter.id === "distance"
                ? {
                    hasAccess: Boolean(userLocation),
                    onEnable: () => void requestUserLocation(),
                    isEnabling: isRequestingUserLocation,
                  }
                : undefined
            }
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
            onChange={(newValue) => updatePendingFilter(filter.id, newValue)}
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
            onChange={(newValue) => updatePendingFilter(filter.id, newValue)}
          />
        );

      case "async-select":
        if (!filter.asyncFetch) return null;
        return (
          <PaginatedAsyncBrowseFilter
            key={filter.id}
            id={filter.id}
            label={filter.label}
            placeholder={filter.placeholder}
            asyncFetch={filter.asyncFetch}
            value={
              typeof value === "string"
                ? value
                : (filter.defaultValue as string) || ""
            }
            onChange={(newValue) => updatePendingFilter(filter.id, newValue)}
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
