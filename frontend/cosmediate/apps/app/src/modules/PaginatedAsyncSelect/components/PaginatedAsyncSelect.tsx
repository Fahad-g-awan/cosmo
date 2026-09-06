"use client";

import * as React from "react";

import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import type { PaginatedAsyncFetchFn, PaginatedAsyncOption } from "../types";
import {
  PAGINATED_ASYNC_DEFAULT_DEBOUNCE_MS,
  PAGINATED_ASYNC_SCROLL_THRESHOLD_PX,
} from "../types";
import { usePaginatedAsyncOptions } from "../hooks/usePaginatedAsyncOptions";

import { Check, ChevronsUpDown, X } from "lucide-react";

type ValueChangeMeta = {
  option?: PaginatedAsyncOption;
};

interface PaginatedAsyncSelectBaseProps {
  fetchPage: PaginatedAsyncFetchFn;
  label?: string;
  placeholder?: React.ReactNode;
  searchPlaceholder?: string;
  emptyText?: React.ReactNode;
  loadingText?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  buttonClassName?: string;
  popoverClassName?: string;
  itemClassName?: string;
  debounceMs?: number;
  reloadKey?: string | number;
  seedOptions?: PaginatedAsyncOption[];
  lazy?: boolean;
  enabled?: boolean;
  clearable?: boolean;
  renderSelected?: (option?: PaginatedAsyncOption) => React.ReactNode;
  renderOption?: (
    option: PaginatedAsyncOption,
    selected: boolean,
  ) => React.ReactNode;
}

interface SinglePaginatedAsyncSelectProps extends PaginatedAsyncSelectBaseProps {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, meta?: ValueChangeMeta) => void;
}

interface MultiPaginatedAsyncSelectProps extends PaginatedAsyncSelectBaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (
    value: string[],
    meta?: { options: PaginatedAsyncOption[] },
  ) => void;
  showSelectedItems?: boolean;
}

export type PaginatedAsyncSelectProps =
  | SinglePaginatedAsyncSelectProps
  | MultiPaginatedAsyncSelectProps;

const EMPTY_MULTI: string[] = [];

function LoadingRow({ label }: { label: React.ReactNode }) {
  return (
    <div className="flex flex-col mx-3 items-center justify-center gap-2 py-4 text-xs text-400">
      {/* <Loader2 className="size-4 animate-spin" aria-hidden /> */}
      <Skeleton className="w-full h-8" />
      {/* <span>{label}</span> */}
    </div>
  );
}

export function PaginatedAsyncSelect(props: PaginatedAsyncSelectProps) {
  const {
    fetchPage,
    label,
    placeholder = "Select",
    searchPlaceholder = "Search...",
    emptyText = "No results found.",
    loadingText = "Loading...",
    disabled = false,
    required = false,
    className,
    labelClassName,
    buttonClassName,
    popoverClassName,
    itemClassName,
    debounceMs = PAGINATED_ASYNC_DEFAULT_DEBOUNCE_MS,
    reloadKey,
    seedOptions,
    lazy = true,
    enabled = true,
    clearable = false,
    renderSelected,
    renderOption,
  } = props;

  const [open, setOpen] = React.useState(false);

  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    search,
    setSearch,
    loadMore,
  } = usePaginatedAsyncOptions({
    fetchPage,
    enabled,
    debounceMs,
    reloadKey,
    seedOptions,
    lazy,
    open,
  });

  const isControlled = props.value !== undefined;
  const isMultiple = props.multiple === true;

  const controlledSingleValue = !isMultiple ? props.value : undefined;
  const controlledMultiValue = isMultiple ? props.value : undefined;

  const [internalSingle, setInternalSingle] = React.useState<
    string | undefined
  >(!isMultiple ? props.defaultValue : undefined);
  const [internalMulti, setInternalMulti] = React.useState<string[]>(
    isMultiple ? (props.defaultValue ?? EMPTY_MULTI) : EMPTY_MULTI,
  );

  const selectedSingle = React.useMemo((): string | undefined => {
    if (isMultiple) return undefined;
    return isControlled ? controlledSingleValue : internalSingle;
  }, [controlledSingleValue, internalSingle, isControlled, isMultiple]);

  const selectedMulti = React.useMemo((): string[] => {
    if (!isMultiple) return EMPTY_MULTI;
    return isControlled ? (controlledMultiValue ?? EMPTY_MULTI) : internalMulti;
  }, [controlledMultiValue, internalMulti, isControlled, isMultiple]);

  const selectedOptions = React.useMemo(() => {
    const selectedValues = isMultiple
      ? selectedMulti
      : selectedSingle
        ? [selectedSingle]
        : [];
    return selectedValues
      .map((value) => items.find((item) => item.value === value))
      .filter(Boolean) as PaginatedAsyncOption[];
  }, [isMultiple, items, selectedMulti, selectedSingle]);

  const triggerLabel = React.useMemo(() => {
    if (isMultiple) {
      if (selectedMulti.length === 0) return placeholder;
      if (selectedMulti.length === 1) {
        const option = items.find((item) => item.value === selectedMulti[0]);
        return option?.label ?? placeholder;
      }
      return `${selectedMulti.length} selected`;
    }

    const option =
      items.find((item) => item.value === selectedSingle) ?? selectedOptions[0];
    if (renderSelected) return renderSelected(option);
    return option?.label ?? placeholder;
  }, [
    isMultiple,
    items,
    placeholder,
    renderSelected,
    selectedMulti,
    selectedOptions,
    selectedSingle,
  ]);

  const commitSingle = (next?: string, option?: PaginatedAsyncOption) => {
    if (!isMultiple) {
      if (!isControlled) setInternalSingle(next);
      props.onValueChange?.(next ?? "", { option });
    }
  };

  const commitMulti = (next: string[]) => {
    if (isMultiple) {
      if (!isControlled) setInternalMulti(next);
      const options = next
        .map((value) => items.find((item) => item.value === value))
        .filter(Boolean) as PaginatedAsyncOption[];
      props.onValueChange?.(next, { options });
    }
  };

  const toggleMulti = (option: PaginatedAsyncOption) => {
    const exists = selectedMulti.includes(option.value);
    const next = exists
      ? selectedMulti.filter((value) => value !== option.value)
      : [...selectedMulti, option.value];
    commitMulti(next);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const remaining =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    if (remaining <= PAGINATED_ASYNC_SCROLL_THRESHOLD_PX) {
      loadMore();
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <Label className={cn("text-sm font-medium", labelClassName)}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {isMultiple &&
        props.showSelectedItems !== false &&
        selectedMulti.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedMulti.map((value) => {
              const option = items.find((item) => item.value === value);
              return (
                <div
                  key={value}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                  <span>{option?.label ?? value}</span>
                  <button
                    type="button"
                    onClick={() =>
                      commitMulti(
                        selectedMulti.filter((item) => item !== value),
                      )
                    }
                    className="hover:text-gray-800"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || !enabled}
            className={cn(
              "w-full justify-between gap-2 bg-white py-2 text-[12px] text-400",
              buttonClassName,
            )}
          >
            <span className="truncate">{triggerLabel}</span>
            <div className="flex items-center gap-2">
              {clearable && !isMultiple && selectedSingle && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    commitSingle(undefined);
                    setOpen(false);
                  }}
                  className="p-0!"
                >
                  <X className="size-3 shrink-0 opacity-50 hover:opacity-80" />
                </Button>
              )}
              <ChevronsUpDown className="size-3 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            "w-[var(--radix-popover-trigger-width)] rounded-xl p-0",
            popoverClassName,
          )}
          align="start"
        >
          <Command shouldFilter={false} className="rounded-xl">
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />

            <CommandList className="max-h-64" onScroll={handleScroll}>
              {loading && items.length === 0 ? (
                <LoadingRow label={loadingText} />
              ) : error ? (
                <div className="p-3 text-center text-xs text-red-500">
                  {error}
                </div>
              ) : (
                <>
                  <CommandEmpty className="p-3 text-center text-xs text-400">
                    {emptyText}
                  </CommandEmpty>

                  <CommandGroup>
                    {items.map((option) => {
                      const isSelected = isMultiple
                        ? selectedMulti.includes(option.value)
                        : option.value === selectedSingle;

                      return (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                          onSelect={() => {
                            if (isMultiple) {
                              toggleMulti(option);
                              return;
                            }
                            commitSingle(option.value, option);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 text-xs text-700",
                            itemClassName,
                          )}
                        >
                          {isMultiple ? (
                            <div
                              className={cn(
                                "flex size-4 items-center justify-center rounded border",
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-gray-300 bg-white",
                              )}
                            >
                              {isSelected && (
                                <Check className="size-3 text-white" />
                              )}
                            </div>
                          ) : null}

                          <span className="min-w-0 flex-1 truncate">
                            {renderOption
                              ? renderOption(option, isSelected)
                              : option.label}
                          </span>

                          {!isMultiple && (
                            <Check
                              className={cn(
                                "size-4 shrink-0",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>

                  {loadingMore && <LoadingRow label={loadingText} />}
                  {!loadingMore && hasMore && items.length > 0 && (
                    <div className="py-2 text-center text-[11px] text-400">
                      Scroll for more
                    </div>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default PaginatedAsyncSelect;
