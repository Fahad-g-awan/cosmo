import React, { useEffect } from "react";
import {
  useFilters,
  type FilterConfig,
  // type FiltersContextType as FiltersContext,
} from "@cosmediate/browse-manager";

import { ScrollArea } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { RangeDropdownFilter } from "@app/modules/SearchAndFilter/Filters/RangeDropdownFilter";
import { MultiSelectFilter } from "@app/modules/SearchAndFilter/Filters/MultiSelectFilter";
import { RangeSliderFilter } from "@app/modules/SearchAndFilter/Filters/RangeSliderFilter";
import { RangeDateFilter } from "@app/modules/SearchAndFilter/Filters/RangeDateFilter";
import { CheckboxFilter } from "@app/modules/SearchAndFilter/Filters/CheckboxFilter";
import { SelectFilter } from "@app/modules/SearchAndFilter/Filters/SelectFilter";
import { RadioFilter } from "@app/modules/SearchAndFilter/Filters/RadioFilter";
import { PaginatedAsyncBrowseFilter } from "@app/modules/PaginatedAsyncSelect";
import { useDialog } from "@app/context/dialog/DialogProvider";

export const BrowseFiltersDialog = () => {
  const { updateDialogPayload, dialog } = useDialog();
  const {
    config,
    // searchQuery,
    // pendingSearchQuery,
    // activeFilters,
    pendingFilters,
    // setPendingSearchQuery,
    // setSearchQuery,
    updatePendingFilter,
    applyFilters,
    clearFilters,
    // clearFilter,
  } = useFilters();

  // Update the dialog payload with fresh callbacks whenever they change
  useEffect(() => {
    // Get the current payload from the dialog
    const currentPayload = dialog.payload;
    if (currentPayload) {
      updateDialogPayload({
        payload: {
          ...currentPayload,
          onConfirm: applyFilters,
          onCancel: clearFilters,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyFilters, clearFilters]);

  const renderFilter = (filter: FilterConfig) => {
    const value = pendingFilters[filter.id]?.value;
    console.log("value", value);

    switch (filter.type) {
      case "range-date":
        return (
          <RangeDateFilter
            key={filter.id}
            config={{
              type: "dateRange",
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
            onChange={(newValue) => updatePendingFilter(filter.id, newValue)}
          />
        );

      case "range-dropdown":
        return (
          <RangeDropdownFilter
            key={filter.id}
            config={{
              type: "range-dropdown",
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
          />
        );

      case "select":
        return (
          <SelectFilter
            key={filter.id}
            config={{
              type: "select",
              id: filter.id,
              label: filter.label,
              options:
                filter.options?.map((o) => ({
                  label: o.label,
                  value: String(o.value),
                })) || [],
              defaultValue: String(filter.defaultValue || ""),
              placeholder: filter.placeholder,
            }}
            value={
              typeof value === "string" || typeof value === "number"
                ? value
                : String(filter.defaultValue || "")
            }
            onChange={(newValue) => updatePendingFilter(filter.id, newValue)}
          />
        );

      case "multiselect":
        return (
          <MultiSelectFilter
            key={filter.id}
            config={{
              type: "multiselect",
              id: filter.id,
              label: filter.label,
              options:
                filter.options?.map((o) => ({
                  label: o.label,
                  value: String(o.value),
                })) || [],
              defaultValue: Array.isArray(filter.defaultValue)
                ? filter.defaultValue.map(String)
                : [],
              placeholder: filter.placeholder,
            }}
            value={
              Array.isArray(value)
                ? value.map(String)
                : Array.isArray(filter.defaultValue)
                  ? filter.defaultValue.map(String)
                  : []
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
              typeof value === "string" || typeof value === "number"
                ? String(value)
                : String(filter.defaultValue ?? "")
            }
            onChange={(newValue) => updatePendingFilter(filter.id, newValue)}
          />
        );

      case "async-multiselect":
        if (!filter.asyncFetch) return null;
        return (
          <PaginatedAsyncBrowseFilter
            key={filter.id}
            id={filter.id}
            label={filter.label}
            placeholder={filter.placeholder}
            asyncFetch={filter.asyncFetch}
            multiple
            value={
              Array.isArray(value)
                ? value.map(String)
                : Array.isArray(filter.defaultValue)
                  ? filter.defaultValue.map(String)
                  : []
            }
            onChange={(newValue) => updatePendingFilter(filter.id, newValue)}
          />
        );

      case "range-slider":
        return (
          <RangeSliderFilter
            key={filter.id}
            config={{
              type: "range-slider",
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
          />
        );

      case "checkbox":
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
          />
        );

      case "radio":
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

      default:
        return null;
    }
  };

  if (!config?.filters || config?.filters.length === 0)
    return <div>No Filters Available</div>;

  return (
    <ScrollArea className="w-full h-[50dvh] max-sm:h-[280px]">
      <div
        className={cn(
          "w-full flex flex-col items-center justify-center gap-3 mb-5 max-sm:mb-10",
        )}
      >
        <div
          className={cn("w-full flex flex-col items-start justify-start gap-7")}
        >
          {config?.filters.map((filter) => renderFilter(filter))}
        </div>

        {/* <button
          onClick={() =>
            openDialog({
              dialogType: "delete",
              payload: { title: "Testing", onConfirm: () => {} },
            })
          }
        >
          Delete
        </button> */}
      </div>
    </ScrollArea>
  );
};
