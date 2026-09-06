"use client";

import { FiX } from "react-icons/fi";

import type { AsyncFilterFetchFn } from "@cosmediate/browse-manager";
import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import { FilterLabel } from "@web/components/searchAndFilters/filters/FilterLabel";
import { PaginatedAsyncSelect } from "./PaginatedAsyncSelect";
import type { PaginatedAsyncFetchFn } from "../types";

function wrapAsyncFetch(asyncFetch: AsyncFilterFetchFn): PaginatedAsyncFetchFn {
  return async ({ search, nextToken }) => {
    const result = await asyncFetch({ search, nextToken });
    return {
      items: result.items.map((item) => ({
        value: String(item.value),
        label: item.label,
        searchText: item.label,
      })),
      nextToken: result.nextToken,
    };
  };
}

interface PaginatedAsyncBrowseFilterProps {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  asyncFetch: AsyncFilterFetchFn;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}

export function PaginatedAsyncBrowseFilter({
  label,
  description,
  placeholder,
  asyncFetch,
  value,
  onChange,
  multiple = false,
}: PaginatedAsyncBrowseFilterProps) {
  const browse = useTranslations("browse");
  const fetchPage = wrapAsyncFetch(asyncFetch);

  const handleClear = () => {
    onChange(multiple ? [] : "");
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : Boolean(value);

  return (
    <div className="flex w-full flex-col items-start justify-start gap-3">
      <FilterLabel label={label} description={description} />

      <div
        className={cn(
          "grid w-full grid-cols-[1fr_20px] items-center justify-center gap-2",
        )}
      >
        {multiple ? (
          <PaginatedAsyncSelect
            multiple
            fetchPage={fetchPage}
            value={Array.isArray(value) ? value.map(String) : []}
            onValueChange={(next) => onChange(next)}
            placeholder={placeholder ?? browse.filters.placeholders.select}
            showSelectedItems
            buttonClassName="text-xs"
          />
        ) : (
          <PaginatedAsyncSelect
            fetchPage={fetchPage}
            value={typeof value === "string" ? value : String(value ?? "")}
            onValueChange={(next) => onChange(next)}
            placeholder={placeholder ?? browse.filters.placeholders.select}
            clearable
            buttonClassName="text-xs"
          />
        )}

        <button
          type="button"
          onClick={handleClear}
          disabled={!hasValue}
          className={cn(
            "text-400 transition-colors",
            hasValue
              ? "cursor-pointer hover:text-danger"
              : "cursor-not-allowed opacity-30",
          )}
          title={browse.filters.clearFilterTitle}
        >
          <FiX className="size-4" />
        </button>
      </div>
    </div>
  );
}
