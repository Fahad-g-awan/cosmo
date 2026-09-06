"use client";

import React, { useCallback } from "react";
import { Label } from "@cosmediate/ui";
import { Textarea } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import {
  useFormValue,
  useFormError,
  useFormSetValue,
} from "@cosmediate/form-core";
import { FieldError } from "../primitives/FieldError";

interface ControlledTextareaFieldProps {
  path: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  textareaClassName?: string;
  labelClassName?: string;
  rows?: number;
  maxLength?: number;
}

/**
 * A controlled textarea field bound to the form store
 *
 * @example
 * <ControlledTextareaField
 *   path="message"
 *   label="Message"
 *   placeholder="Enter your message"
 *   required
 * />
 */
export function ControlledTextareaField({
  path,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  textareaClassName,
  labelClassName,
  rows,
  maxLength,
}: ControlledTextareaFieldProps) {
  const value = useFormValue<string | undefined>(path);
  const error = useFormError(path);
  const setValue = useFormSetValue();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(path, e.target.value);
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
      <Textarea
        id={path}
        value={value ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={cn(error && "border-red-500", textareaClassName)}
      />
      <FieldError error={error} />
    </div>
  );
}
