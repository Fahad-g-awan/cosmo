"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@cosmediate/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cosmediate/ui/components/popover";
import { Button, Label } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

/**
 * Generic option type:
 * - value: unique string identifier
 * - label: can be string OR ReactNode (icon, image, custom layout, etc.)
 * - searchText: plain text used for searching when label is not a string
 * - disabled: optional
 */
export type ComboOption<V extends string = string> = {
  value: V;
  label: React.ReactNode;
  searchText?: string;
  disabled?: boolean;
};

/**
 * Accept options as:
 * - string[]  => value = string, label = string, searchText = string
 * - ComboOption[] => fully custom
 */
export type ComboOptions<V extends string = string> = V[] | ComboOption<V>[];

type ValueChangeMeta = {
  option?: ComboOption<string>;
};

interface ComboboxSelectProps<V extends string = string> {
  options: ComboOptions<V>;

  value?: V; // controlled
  defaultValue?: V; // uncontrolled
  onValueChange?: (value: V, meta?: ValueChangeMeta) => void;

  label?: string;
  placeholder?: React.ReactNode;
  searchPlaceholder?: string;
  emptyText?: React.ReactNode;

  disabled?: boolean;
  buttonClassName?: string;
  popoverClassName?: string;
  itemClassName?: string;
  labelClassName?: string;

  required?: boolean;

  // Optional: customize how the trigger shows selected value
  renderSelected?: (option?: ComboOption<V>) => React.ReactNode;

  // Optional: allow clearing selection
  clearable?: boolean;

  readOnly?: boolean;
}

function normalizeOptions<V extends string>(
  options: ComboOptions<V>
): ComboOption<V>[] {
  if (options.length === 0) return [];

  const first = options[0] as any;
  if (typeof first === "string") {
    return (options as V[]).map((v) => ({
      value: v,
      label: v,
      searchText: v,
    }));
  }

  return (options as ComboOption<V>[]).map((o) => ({
    ...o,
    searchText:
      o.searchText ?? (typeof o.label === "string" ? o.label : String(o.value)),
  }));
}

export function ComboboxSelect<V extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,

  placeholder = "Select",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  label,

  disabled,
  buttonClassName,
  popoverClassName,
  itemClassName,
  labelClassName,

  required,

  renderSelected,

  clearable = false,
  readOnly = false,
}: ComboboxSelectProps<V>) {
  const normalized = React.useMemo(() => normalizeOptions(options), [options]);

  const [open, setOpen] = React.useState(false);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<V | undefined>(
    defaultValue
  );

  const selectedValue = (isControlled ? value : internalValue) as V | undefined;

  const selectedOption = React.useMemo(
    () => normalized.find((o) => o.value === selectedValue),
    [normalized, selectedValue]
  );

  const triggerLabel = React.useMemo(() => {
    if (renderSelected && selectedOption) return renderSelected(selectedOption);
    return selectedOption?.label ?? placeholder;
  }, [renderSelected, selectedOption, placeholder]);

  const commitValue = (next?: V, option?: ComboOption<V>) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next as V, { option: option as any });
  };

  return (
    <div className="w-full flex flex-col items-center justify-start gap-2">
      {label && (
        <Label className={cn("self-start text-sm font-medium", labelClassName)}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "bg-white text-[12px] text-400 py-2 gap-2 justify-between w-full",
              buttonClassName
            )}
          >
            <span className="truncate capitalize">{triggerLabel}</span>

            <div className="flex items-center gap-2">
              {clearable && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    commitValue(undefined);
                    setOpen(false);
                  }}
                  className="p-0!"
                >
                  <X className="size-3 opacity-50 hover:opacity-80 shrink-0" />
                </Button>
              )}
              <ChevronsUpDown className="size-3 opacity-50 shrink-0" />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            "w-[calc(100vw-1.5rem)] sm:w-[var(--radix-popover-trigger-width)] rounded-xl p-0",
            popoverClassName,
          )}
          align="start"
          collisionPadding={12}
        >
          <Command
            className="rounded-xl"
            // Use Command's built-in filtering but based on our searchText
            filter={(itemValue, search) => {
              const opt = normalized.find((o) => o.value === itemValue);
              const hay = (opt?.searchText ?? opt?.value ?? "")
                .toString()
                .toLowerCase();
              const needle = (search ?? "").toLowerCase().trim();
              if (!needle) return 1;
              return hay.includes(needle) ? 1 : 0;
            }}
          >
            {!readOnly && <CommandInput placeholder={searchPlaceholder} />}

            <CommandList>
              <CommandEmpty className="w-full text-400 text-xs p-2 text-center">
                {emptyText}
              </CommandEmpty>

              <CommandGroup>
                {normalized.map((option) => {
                  const isSelected = option.value === selectedValue;

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={(val) => {
                        // val is option.value
                        commitValue(val as V, option);
                        setOpen(false);
                      }}
                      className={cn(
                        "cursor-pointer text-700 text-xs flex items-center gap-2",
                        readOnly && "pointer-events-none opacity-50",
                        itemClassName
                      )}
                    >
                      <span className="flex-1 min-w-0 truncate capitalize">
                        {option.label}
                      </span>

                      {/* check on RIGHT */}
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ComboboxSelect;
