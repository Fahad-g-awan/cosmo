"use client";

import React, { useCallback } from "react";
import { Label, Switch } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import {
  useFormValue,
  useFormError,
  useFormSetValue,
} from "@cosmediate/form-core";
import { FieldError } from "../primitives/FieldError";

interface ControlledSwitchFieldProps {
  path: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  defaultChecked?: boolean;
}

/**
 * A controlled switch field bound to the form store
 *
 * @example
 * <ControlledSwitchField
 *   path="published"
 *   label="Published"
 *   description="Make this item visible to users"
 * />
 */
export function ControlledSwitchField({
  path,
  label,
  description,
  required = false,
  disabled = false,
  className,
  labelClassName,
  defaultChecked = false,
}: ControlledSwitchFieldProps) {
  const value = useFormValue<boolean | undefined>(path);
  const error = useFormError(path);
  const setValue = useFormSetValue();

  const handleChange = useCallback(
    (checked: boolean) => {
      setValue(path, checked);
    },
    [path, setValue]
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <div>
            <Label
              htmlFor={path}
              className={cn("text-sm font-medium", labelClassName)}
            >
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </Label>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}
        <Switch
          id={path}
          checked={value ?? defaultChecked}
          onCheckedChange={handleChange}
          disabled={disabled}
        />
      </div>
      <FieldError error={error} />
    </div>
  );
}
