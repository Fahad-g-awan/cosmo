"use client";

import React, { useCallback, useState } from "react";
import { Badge, Input, Label } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import {
  useFormValue,
  useFormError,
  useFormSetValue,
} from "@cosmediate/form-core";
import { FieldError } from "../primitives/FieldError";

interface ControlledTextFieldProps {
  path: string;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "number" | "tel" | "password" | "tags";
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  tagClassName?: string;
  /** Minimum characters required for each tag when `type="tags"`. Default: 3. */
  tagMinLength?: number;
  /** When set, runs on blur and writes the transformed value back to the form. */
  transformOnBlur?: (value: string) => string | undefined;
}

/**
 * A controlled text input field bound to the form store
 *
 * @example
 * <ControlledTextField
 *   path="firstName"
 *   label="First Name"
 *   required
 * />
 *
 * @example
 * <ControlledTextField
 *   path="tags"
 *   label="Tags"
 *   type="tags"
 *   placeholder="Type and press Enter"
 * />
 */
export function ControlledTextField({
  path,
  label,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  className,
  labelClassName,
  inputClassName,
  tagClassName,
  tagMinLength = 3,
  transformOnBlur,
}: ControlledTextFieldProps) {
  const value = useFormValue<string | number | string[] | undefined>(path);
  const error = useFormError(path);
  const setValue = useFormSetValue();

  const [tagInput, setTagInput] = useState("");
  const [tagInputError, setTagInputError] = useState<string | undefined>();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue =
        type === "number"
          ? e.target.value // Keep as string, Zod preprocess handles conversion
          : e.target.value;
      setValue(path, newValue);
    },
    [path, setValue, type]
  );

  const handleBlur = useCallback(() => {
    if (!transformOnBlur || typeof value !== "string") return;
    const next = transformOnBlur(value);
    if (next !== value) {
      setValue(path, next);
    }
  }, [transformOnBlur, value, setValue, path]);

  const tags = type === "tags" ? (Array.isArray(value) ? value : []) : [];

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed) return;
      if (trimmed.length < tagMinLength) {
        setTagInputError(
          `Each tag must be at least ${tagMinLength} characters`,
        );
        return;
      }
      if (tags.includes(trimmed)) {
        setTagInputError("This tag is already added");
        return;
      }
      setTagInputError(undefined);
      setValue(path, [...tags, trimmed]);
    },
    [path, setValue, tags, tagMinLength]
  );

  const removeTag = useCallback(
    (index: number) => {
      setValue(
        path,
        tags.filter((_, i) => i !== index)
      );
    },
    [path, setValue, tags]
  );

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag(tagInput);
        // Only clear input when the tag was accepted
        const trimmed = tagInput.trim();
        if (
          trimmed &&
          trimmed.length >= tagMinLength &&
          !tags.includes(trimmed)
        ) {
          setTagInput("");
        }
      } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
        removeTag(tags.length - 1);
      }
    },
    [addTag, removeTag, tagInput, tags, tagMinLength]
  );

  if (type === "tags") {
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
        <Input
          id={path}
          type="text"
          value={tagInput}
          onChange={(e) => {
            setTagInput(e.target.value);
            if (tagInputError) setTagInputError(undefined);
          }}
          onKeyDown={handleTagKeyDown}
          placeholder={placeholder ?? "Type and press Enter"}
          disabled={disabled}
          className={cn(
            (error || tagInputError) && "border-red-500",
            inputClassName,
          )}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag, index) => (
              <Badge
                key={`${tag}-${index}`}
                variant="secondary"
                className={cn("gap-1 pr-1 text-xs font-normal", tagClassName)}
              >
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3 cursor-pointer"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span className="sr-only">Remove {tag}</span>
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}
        <FieldError error={tagInputError ?? error} />
      </div>
    );
  }

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
      <Input
        id={path}
        type={type}
        value={value ?? ""}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(error && "border-red-500", inputClassName)}
      />
      <FieldError error={error} />
    </div>
  );
}
