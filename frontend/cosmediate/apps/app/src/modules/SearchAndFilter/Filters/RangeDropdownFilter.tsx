import React, { useMemo } from "react";
import { Separator } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { FiltersSelect } from "./FiltersSelect";
import { FilterLabel } from "./FilterLabel";
import { FiX } from "react-icons/fi";
import { RangeDropdownFilterConfig } from "../types";

interface RangeDropdownFilterProps {
  config: RangeDropdownFilterConfig;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const RangeDropdownFilter = ({
  config,
  value,
  onChange,
}: RangeDropdownFilterProps) => {
  // Generate options from min/max/step if not provided
  const rangeOptions = useMemo(() => {
    if (config.options) {
      return config.options.map((o) => ({
        label: o.label,
        value: String(o.value),
      }));
    }
    // Generate options from min to max with step
    const options = [];
    for (let i = config.min; i <= config.max; i += config.step) {
      const label = config.unit ? `${config.unit}${i}` : String(i);
      options.push({ label, value: String(i) });
    }
    return options;
  }, [config]);

  const handleMinChange = (val: string | number | boolean) => {
    const numVal = typeof val === "string" ? Number(val) : Number(val);
    onChange([numVal, value[1]]);
  };

  const handleMaxChange = (val: string | number | boolean) => {
    const numVal = typeof val === "string" ? Number(val) : Number(val);
    onChange([value[0], numVal]);
  };

  const handleClear = () => {
    onChange(config.defaultValue);
  };

  return (
    <div className="w-full flex flex-col items-start justify-start gap-3">
      <FilterLabel label={config.label} description={config.description} />

      <div
        className={cn(
          "w-full grid grid-cols-[1fr_20px] items-center justify-center gap-2"
        )}
      >
        <div
          className={cn(
            "w-full grid grid-cols-[1fr_10px_1fr] items-center justify-center gap-2"
          )}
        >
          <FiltersSelect
            options={rangeOptions}
            placeholder="Min"
            onChange={handleMinChange}
            selected={String(value[0])}
          />

          <Separator orientation="horizontal" className="w-[10px] bg-300" />

          <FiltersSelect
            options={rangeOptions}
            placeholder="Max"
            onChange={handleMaxChange}
            selected={String(value[1])}
          />
        </div>

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
