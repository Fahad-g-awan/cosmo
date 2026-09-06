"use client";

import React, { useCallback, useMemo } from "react";
import { DatePicker, Label } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import {
  useFormValue,
  useFormError,
  useFormSetValue,
} from "@cosmediate/form-core";
import { FieldError } from "../primitives/FieldError";

interface ControlledDatePickerFieldProps {
  path: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
  triggerClassName?: string;
  iconClassName?: string;
  popoverClassName?: string;
  calendarClassName?: string;
}

/**
 * A controlled date picker field bound to the form store.
 * Stores the value as an ISO string in the form state.
 *
 * @example
 * <ControlledDatePickerField
 *   path="publishedAt"
 *   label="Publish Date"
 *   placeholder="Select a date"
 *   required
 * />
 */
export function ControlledDatePickerField({
  path,
  label,
  placeholder = "Select a date",
  required = false,
  disabled = false,
  className,
  labelClassName,
  containerClassName,
  triggerClassName,
  iconClassName,
  popoverClassName,
  calendarClassName,
}: ControlledDatePickerFieldProps) {
  const value = useFormValue<string | undefined>(path);
  const error = useFormError(path);
  const setValue = useFormSetValue();

  const dateValue = useMemo(() => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const handleChange = useCallback(
    (date: Date | undefined) => {
      setValue(path, date?.toISOString() ?? "");
    },
    [path, setValue]
  );

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <Label
          htmlFor={path}
          className={cn("text-sm font-medium", labelClassName)}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      )}
      <DatePicker
        id={path}
        value={dateValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        containerClassName={containerClassName}
        triggerClasses={cn(error && "border-red-500", triggerClassName)}
        iconClassName={iconClassName}
        popoverClassName={popoverClassName}
        calendarClassName={calendarClassName}
      />
      <FieldError error={error} />
    </div>
  );
}
