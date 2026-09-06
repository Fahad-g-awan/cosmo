import React from "react";

import { Slider } from "@cosmediate/ui";

import { RangeFilterConfig } from "../types";
import { FilterLabel } from "./FilterLabel";

interface RangeFilterProps {
  config: RangeFilterConfig;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const RangeFilter = ({ config, value, onChange }: RangeFilterProps) => {
  const formatValue = (val: number) => {
    if (config.formatValue) {
      return config.formatValue(val);
    }
    return config.unit ? `${config.unit}${val}` : `${val}`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <FilterLabel label={config.label} description={config.description} />

      <div className="w-full flex flex-col items-center justify-center gap-3">
        <Slider
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onValueChange={(val: number[]) => {
            if (
              val.length === 2 &&
              typeof val[0] === "number" &&
              typeof val[1] === "number"
            ) {
              onChange([val[0], val[1]]);
            }
          }}
          className="w-full"
        />

        <div className="w-full flex justify-between items-center text-xs text-600 leading-[17px] tracking-[0.22px]">
          <span>{formatValue(value[0])}</span>
          <span>{formatValue(value[1])}</span>
        </div>
      </div>
    </div>
  );
};
