"use client";

import { useCallback } from "react";

import {
  useFormError,
  useFormSetValue,
  useFormValue,
} from "@cosmediate/form-core";
import { FieldError } from "@cosmediate/form-ui";
import { cn } from "@cosmediate/ui/lib/utils";

import type { PaginatedAsyncFetchFn, PaginatedAsyncOption } from "../types";
import { PaginatedAsyncSelect } from "./PaginatedAsyncSelect";

interface ControlledPaginatedAsyncSelectBaseProps {
  path: string;
  fetchPage: PaginatedAsyncFetchFn;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  debounceMs?: number;
  reloadKey?: string | number;
  seedOptions?: PaginatedAsyncOption[];
  lazy?: boolean;
  enabled?: boolean;
  renderOption?: (
    option: PaginatedAsyncOption,
    selected: boolean,
  ) => React.ReactNode;
}

interface ControlledSingleProps extends ControlledPaginatedAsyncSelectBaseProps {
  multiple?: false;
  clearable?: boolean;
  renderSelected?: (option?: PaginatedAsyncOption) => React.ReactNode;
}

interface ControlledMultiProps extends ControlledPaginatedAsyncSelectBaseProps {
  multiple: true;
  showSelectedItems?: boolean;
}

export type ControlledPaginatedAsyncSelectFieldProps =
  | ControlledSingleProps
  | ControlledMultiProps;

function ControlledPaginatedAsyncSingleField({
  path,
  fetchPage,
  label,
  placeholder,
  searchPlaceholder,
  required = false,
  disabled = false,
  className,
  labelClassName,
  debounceMs,
  reloadKey,
  seedOptions,
  lazy,
  enabled,
  clearable,
  renderSelected,
  renderOption,
}: ControlledSingleProps) {
  const error = useFormError(path);
  const setValue = useFormSetValue();
  const value = useFormValue<string | undefined>(path);

  const handleChange = useCallback(
    (nextValue: string) => {
      setValue(path, nextValue || undefined);
    },
    [path, setValue],
  );

  return (
    <div className={cn("w-full space-y-2", className)}>
      <PaginatedAsyncSelect
        fetchPage={fetchPage}
        label={label}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        required={required}
        disabled={disabled}
        labelClassName={labelClassName}
        debounceMs={debounceMs}
        reloadKey={reloadKey}
        seedOptions={seedOptions}
        lazy={lazy}
        enabled={enabled}
        clearable={clearable}
        value={value ?? ""}
        onValueChange={handleChange}
        renderSelected={renderSelected}
        renderOption={renderOption}
      />
      <FieldError error={error} />
    </div>
  );
}

function ControlledPaginatedAsyncMultiField({
  path,
  fetchPage,
  label,
  placeholder,
  searchPlaceholder,
  required = false,
  disabled = false,
  className,
  labelClassName,
  debounceMs,
  reloadKey,
  seedOptions,
  lazy,
  enabled,
  showSelectedItems,
  renderOption,
}: ControlledMultiProps) {
  const error = useFormError(path);
  const setValue = useFormSetValue();
  const values = useFormValue<string[] | undefined>(path);

  const handleChange = useCallback(
    (nextValues: string[]) => {
      setValue(path, nextValues);
    },
    [path, setValue],
  );

  return (
    <div className={cn("w-full space-y-2", className)}>
      <PaginatedAsyncSelect
        multiple
        fetchPage={fetchPage}
        label={label}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        required={required}
        disabled={disabled}
        labelClassName={labelClassName}
        debounceMs={debounceMs}
        reloadKey={reloadKey}
        seedOptions={seedOptions}
        lazy={lazy}
        enabled={enabled}
        value={values ?? []}
        onValueChange={handleChange}
        showSelectedItems={showSelectedItems}
        renderOption={renderOption}
      />
      <FieldError error={error} />
    </div>
  );
}

/** Form-bound paginated async select — loads options via `fetchPage` on open/scroll/search. */
export function ControlledPaginatedAsyncSelectField(
  props: ControlledPaginatedAsyncSelectFieldProps,
) {
  if (props.multiple === true) {
    return <ControlledPaginatedAsyncMultiField {...props} />;
  }
  return <ControlledPaginatedAsyncSingleField {...props} />;
}
