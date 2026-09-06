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

const roundPrice = (value: number) => Math.round(value);

const buildBins = (
  min: number,
  max: number,
  binCount: number,
  histograms: RangeBarFilterProps["histograms"] = [],
) => {
  const range = max - min;
  if (range <= 0) {
    return [{ data: min, count: 0 }];
  }

  const binWidth = range / binCount;
  const result = Array.from({ length: binCount }, (_, i) => {
    const priceFrom = min + i * binWidth;
    const priceTo = min + (i + 1) * binWidth;
    return {
      data: roundPrice((priceFrom + priceTo) / 2),
      count: 0,
    };
  });

  if (histograms.length === binCount) {
    for (let i = 0; i < binCount; i++) {
      result[i]!.count = histograms[i]?.count ?? 0;
    }
    return result;
  }

  for (const hist of histograms) {
    const mid = (hist.priceFrom + hist.priceTo) / 2;
    let idx = Math.floor((mid - min) / binWidth);
    idx = Math.max(0, Math.min(idx, binCount - 1));
    result[idx]!.count += hist.count;
  }

  return result;
};

export const RangeBarFilter = ({
  config,
  value,
  onChange,
  histograms = [],
}: RangeBarFilterProps) => {
  const binCount = config.binCount || 30;
  const min = roundPrice(config.min);
  const max = roundPrice(config.max);

  const bins = useMemo(
    () => buildBins(min, max, binCount, histograms),
    [min, max, binCount, histograms],
  );

  const formatValue = (val: number) => {
    const rounded = roundPrice(val);
    return config.unit ? `${config.unit}${rounded}` : `${rounded}`;
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
