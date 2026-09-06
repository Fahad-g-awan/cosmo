import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";
import { FiltersSelect } from "./FiltersSelect";
import { FilterLabel } from "./FilterLabel";
import { FiX } from "react-icons/fi";
import { SelectFilterConfig } from "../types";

interface SelectFilterProps {
  config: SelectFilterConfig;
  value: string | number;
  onChange: (value: string | number) => void;
}

export const SelectFilter = ({
  config,
  value,
  onChange,
}: SelectFilterProps) => {
  const handleClear = () => {
    onChange(config.defaultValue ?? "");
  };

  // Convert options to string values for FiltersSelect
  const stringOptions = config.options.map((o) => ({
    label: o.label,
    value: String(o.value),
  }));

  console.log("value => select filter", value);

  return (
    <div className="w-full flex flex-col items-start justify-start gap-3">
      <FilterLabel label={config.label} description={config.description} />

      <div
        className={cn(
          "w-full grid grid-cols-[1fr_20px] items-center justify-center gap-2"
        )}
      >
        <FiltersSelect
          options={stringOptions}
          placeholder={config.placeholder || "Select"}
          onChange={(selectedValue) => onChange(String(selectedValue))}
          selected={String(value)}
        />

        <button
          onClick={handleClear}
          className="text-400 hover:text-danger transition-colors cursor-pointer"
          title="Clear filter"
        >
          <FiX className="size-4" />
        </button>
      </div>
    </div>
  );
};
