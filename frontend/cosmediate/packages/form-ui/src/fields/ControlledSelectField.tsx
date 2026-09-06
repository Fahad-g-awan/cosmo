"use client";

import React, { useCallback } from "react";
import {
  ComboboxSelect,
  Label,
  MultiSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import {
  useFormValue,
  useFormError,
  useFormSetValue,
} from "@cosmediate/form-core";
import { FieldError } from "../primitives/FieldError";

export interface SelectOption {
  label: string;
  value: string;
}

// ---------- Single Select Props ----------
interface SingleSelectFieldProps {
  multiple?: false;
}

// ---------- Multiple Select Props ----------
interface MultipleSelectFieldProps {
  multiple: true;
  /** Show selected items as chips above the select */
  showSelectedItems?: boolean;
  /** Show select all option */
  showSelectAll?: boolean;
}

// ---------- Common Props ----------
interface CommonSelectFieldProps {
  path: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  /** When false, hides the clear control (useful for required selects). Default true. */
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

type ControlledSelectFieldProps = CommonSelectFieldProps &
  (SingleSelectFieldProps | MultipleSelectFieldProps);

/**
 * A controlled select field bound to the form store
 *
 * @example
 * // Single select
 * <ControlledSelectField
 *   path="status"
 *   label="Status"
 *   options={[
 *     { label: "Active", value: "ACTIVE" },
 *     { label: "Inactive", value: "INACTIVE" },
 *   ]}
 *   required
 * />
 *
 * // Multiple select
 * <ControlledSelectField
 *   path="categories"
 *   label="Categories"
 *   options={categoryOptions}
 *   multiple
 *   showSelectedItems
 *   showSelectAll
 * />
 */
export function ControlledSelectField(props: ControlledSelectFieldProps) {
  const {
    path,
    label,
    placeholder = "Select...",
    options,
    required = false,
    clearable = true,
    disabled = false,
    className,
    labelClassName,
  } = props;

  const error = useFormError(path);
  const setValue = useFormSetValue();

  // Multiple select mode
  if (props.multiple === true) {
    const { showSelectedItems = true, showSelectAll = false } = props;
    const values = useFormValue<string[] | undefined>(path);

    const handleMultiChange = useCallback(
      (newValues: string[]) => {
        setValue(path, newValues);
      },
      [path, setValue]
    );

    return (
      <div className={cn("w-full space-y-2", className)}>
        {label && (
          <Label className={cn("text-sm font-medium", labelClassName)}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <MultiSelect
          options={options}
          values={values || []}
          onChange={handleMultiChange}
          placeholder={placeholder}
          showSelectedItems={showSelectedItems}
          showSelectAll={showSelectAll}
          label={label}
        />
        <FieldError error={error} />
      </div>
    );
  }

  // Single select mode (default)
  const value = useFormValue<string | undefined>(path);

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(path, newValue);
    },
    [path, setValue]
  );

  return (
    <div className={cn("w-full space-y-2", className)}>
      <ComboboxSelect
        options={options}
        value={value || ""}
        onValueChange={handleChange}
        label={label}
        placeholder={placeholder}
        labelClassName={labelClassName}
        clearable={clearable}
        required={required}
        disabled={disabled}
      />
      <FieldError error={error} />
    </div>
  );
}
