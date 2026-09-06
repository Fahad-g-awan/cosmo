"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";
import { useState, useEffect } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@cosmediate/ui";
import { Button } from "@cosmediate/ui/components/button";
import { cn } from "@cosmediate/ui/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cosmediate/ui/components/popover";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  values?: string[];
  placeholder?: string;
  onChange: (values: string[]) => void;
  className?: string;
  triggerClassName?: string;
  showSelectedItems?: boolean;
  showSelectAll?: boolean;
  label?: string;
  readOnly?: boolean;
}

export const MultiSelect = ({
  options,
  values,
  onChange,
  placeholder,
  className,
  triggerClassName,
  showSelectedItems = true,
  showSelectAll = false,
  label,
  readOnly = false,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(values || []);

  const displayText =
    selected.length > 0
      ? label
        ? `${selected.length} ${label}${selected.length > 1 ? "s" : ""} selected`
        : `${selected.length} item${selected.length > 1 ? "s" : ""} selected`
      : placeholder || "Select items";

  const handleToggle = (optionValue: string) => {
    const newSelected = selected.includes(optionValue)
      ? selected.filter((item) => item !== optionValue)
      : [...selected, optionValue];

    setSelected(newSelected);
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      // Deselect all
      setSelected([]);
      onChange([]);
    } else {
      // Select all
      const allValues = options.map((option) => option.value);
      setSelected(allValues);
      onChange(allValues);
    }
  };

  const handleRemoveSelected = (optionValue: string) => {
    const newSelected = selected.filter((item) => item !== optionValue);
    setSelected(newSelected);
    onChange(newSelected);
  };

  useEffect(() => {
    setSelected(values || []);
  }, [values]);

  return (
    <div className={cn("w-full", className)}>
      {showSelectedItems && selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selected.map((selectedValue) => {
            const option = options.find((opt) => opt.value === selectedValue);
            return (
              <div
                key={selectedValue}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs"
              >
                <span className="capitalize">
                  {option?.label || selectedValue}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSelected(selectedValue)}
                  className="hover:text-gray-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full bg-white text-[12px] text-gray-400 py-2 gap-1 justify-between",
              triggerClassName,
            )}
          >
            {displayText}
            <ChevronsUpDown className="size-3 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[calc(100vw-1.5rem)] sm:w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl"
          align="start"
          collisionPadding={12}
        >
          <Command className="rounded-xl">
            {!readOnly && <CommandInput placeholder="Search..." />}
            <CommandList>
              {selected.length !== options.length && (
                <CommandEmpty className="w-full text-gray-400 text-xs p-2 py-5 pt-6 text-center">
                  No items found
                </CommandEmpty>
              )}

              {showSelectAll && !readOnly && (
                <CommandGroup>
                  <CommandItem
                    onSelect={handleSelectAll}
                    className="cursor-pointer text-700 text-xs"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <div
                        className={cn(
                          "w-4 h-4 border rounded flex items-center justify-center bg-primary border-primary",
                          selected.length === options.length
                            ? "bg-primary-accent"
                            : "bg-white",
                        )}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="flex-1">
                        {selected.length === options.length
                          ? "Deselect All"
                          : "Select All"}
                      </span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              )}

              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleToggle(option.value)}
                      className={cn(
                        "cursor-pointer text-gray-700 text-xs",
                        readOnly && "pointer-events-none opacity-50",
                      )}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <div
                          className={cn(
                            "w-4 h-4 border rounded flex items-center justify-center",
                            isSelected
                              ? "bg-primary border-primary"
                              : "bg-white",
                          )}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="flex-1 capitalize">{option.label}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              {options.length > 0 &&
                selected.length > 0 &&
                selected.length === options.length && (
                  <div className="w-full text-center text-xs text-400 p-2 py-5 pt-6">
                    All items are selected
                  </div>
                )}
              {options.length === 0 && selected.length === 0 && (
                <div className="w-full text-center text-xs text-400 p-2 py-5 pt-6">
                  Items not available
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelect;
