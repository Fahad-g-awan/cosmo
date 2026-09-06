import React from "react";

import { Label, Checkbox } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { CheckboxFilterConfig } from "../types";
import { FilterLabel } from "./FilterLabel";

interface CheckboxFilterProps {
  config: CheckboxFilterConfig;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  isLoading?: boolean;
}

export const CheckboxFilter = ({
  config,
  value,
  onChange,
  isLoading = false,
}: CheckboxFilterProps) => {
  const handleToggle = (optionValue: string | number) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    onChange(newValue);
  };

  const hasNoOptions = !config.options || config.options.length === 0;

  // Hide entire filter if loading is done but no options (API failed or empty)
  if (!isLoading && hasNoOptions) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <FilterLabel label={config.label} description={config.description} />

      <div className="w-full flex flex-col items-start justify-start gap-3">
        {config.options.map((option) => (
          <div
            key={String(option.value)}
            className={cn(
              "w-full flex items-center justify-start cursor-pointer gap-2"
            )}
          >
            <Checkbox
              checked={value.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
              id={`${config.id}-${option.value}`}
              suppressHydrationWarning
              className="data-[state=checked]:bg-primary-accent data-[state=checked]:border-primary-accent-dark data-[state=unchecked]:!bg-white cursor-pointer"
            />
            <Label
              htmlFor={`${config.id}-${option.value}`}
              className={cn(
                "text-sm leading-[18px] text-600 cursor-pointer font-normal"
              )}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
