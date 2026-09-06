import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";
import { FiX } from "react-icons/fi";
import { MultiSelect } from "@cosmediate/ui";
import { FilterLabel } from "./FilterLabel";
import { MultiSelectFilterConfig } from "../types";

interface MultiSelectFilterProps {
  config: MultiSelectFilterConfig;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
}

export const MultiSelectFilter = ({
  config,
  value,
  onChange,
}: MultiSelectFilterProps) => {
  const handleClear = () => {
    onChange(config.defaultValue ?? []);
  };

  // Convert options to string values for MultiSelect
  const stringOptions = config.options.map((o) => ({
    label: o.label,
    value: String(o.value),
  }));

  // Convert values to strings for MultiSelect
  const stringValues = value.map(String);

  return (
    <div className="w-full flex flex-col items-start justify-start gap-3">
      <FilterLabel label={config.label} description={config.description} />

      <div
        className={cn(
          "w-full grid grid-cols-[1fr_20px] items-center justify-center gap-2"
        )}
      >
        <MultiSelect
          options={stringOptions}
          onChange={(values) => onChange(values)}
          values={stringValues}
          placeholder={config.placeholder || "Select"}
          className="w-full text-xs"
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
