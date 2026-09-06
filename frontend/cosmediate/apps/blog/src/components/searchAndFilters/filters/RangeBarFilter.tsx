import React, { useMemo } from "react";
import { Slider, BarGraph } from "@cosmediate/ui";
import { RangeBarFilterConfig } from "../types";
import { FilterLabel } from "./FilterLabel";

interface RangeBarFilterProps {
  config: RangeBarFilterConfig;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  histograms?: { priceFrom: number; priceTo: number; count: number }[];
}

export const RangeBarFilter = ({
  config,
  value,
  onChange,
  histograms = [],
}: RangeBarFilterProps) => {
  // Calculate bins from histogram data
  const bins = useMemo(() => {
    if (histograms && histograms.length > 0) {
      // Convert histogram data to BarGraph format
      return histograms.map((hist) => ({
        data: (hist.priceFrom + hist.priceTo) / 2, // Use midpoint as data value
        count: hist.count,
      }));
    }

    // Fallback: Create empty bins with proper structure
    const binWidth = (config.max - config.min) / (config.binCount || 10);
    return Array.from({ length: config.binCount || 10 }, (_, i) => ({
      data: config.min + i * binWidth + binWidth / 2, // Center of bin
      count: 0,
    }));
  }, [config, histograms]);

  const formatValue = (val: number) => {
    return config.unit ? `${config.unit}${val}` : `${val}`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <FilterLabel label={config.label} description={config.description} />

      <BarGraph
        bins={bins}
        selectedRange={value}
        variant="price"
        barStyle="round"
      />

      <div className="w-full flex flex-col items-center justify-center gap-3 mt-2">
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
