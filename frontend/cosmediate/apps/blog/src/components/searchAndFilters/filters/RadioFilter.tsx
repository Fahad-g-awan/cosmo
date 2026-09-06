import React from "react";

import { Label, RadioGroup, RadioGroupItem } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { RadioFilterConfig } from "../types";
import { FilterLabel } from "./FilterLabel";

interface RadioFilterProps {
  config: RadioFilterConfig;
  value: string | number;
  onChange: (value: string | number) => void;
}

export const RadioFilter = ({ config, value, onChange }: RadioFilterProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <FilterLabel label={config.label} description={config.description} />

      <RadioGroup
        value={String(value)}
        onValueChange={(newValue) => {
          // Convert back to number if original was number
          const option = config.options.find(
            (opt) => String(opt.value) === newValue
          );
          if (option) {
            onChange(option.value);
          }
        }}
        className="w-full flex flex-col items-start justify-start gap-3"
      >
        {config.options.map((option) => (
          <div
            key={String(option.value)}
            className={cn(
              "w-full flex items-center justify-start cursor-pointer gap-2"
            )}
          >
            <RadioGroupItem
              value={String(option.value)}
              id={`${config.id}-${option.value}`}
              className="data-[state=checked]:bg-primary-accent data-[state=checked]:border-primary-accent-dark"
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
      </RadioGroup>
    </div>
  );
};
