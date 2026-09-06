"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { Button, Slider } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { RangeFilterConfig } from "../types";
import { FilterLabel } from "./FilterLabel";

import { MapPin } from "lucide-react";

interface RangeFilterLocationAccess {
  hasAccess: boolean;
  onEnable: () => void;
  isEnabling?: boolean;
}

interface RangeFilterProps {
  config: RangeFilterConfig;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  disabled?: boolean;
  locationAccess?: RangeFilterLocationAccess;
}

export const RangeFilter = ({
  config,
  value,
  onChange,
  disabled = false,
  locationAccess,
}: RangeFilterProps) => {
  const browse = useTranslations("browse");
  const formatValue = (val: number) => {
    if (config.formatValue) {
      return config.formatValue(val);
    }
    return config.unit ? `${config.unit}${val}` : `${val}`;
  };

  const isLocked =
    disabled || Boolean(locationAccess && !locationAccess.hasAccess);
  const showEnableLocation = locationAccess && !locationAccess.hasAccess;

  return (
    <div className="flex w-full flex-col items-center justify-start gap-4">
      <FilterLabel label={config.label} description={config.description} />

      <div
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3",
          isLocked && "opacity-50",
        )}
      >
        <Slider
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          disabled={isLocked}
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

        <div className="flex w-full items-center justify-between text-xs leading-[17px] tracking-[0.22px] text-600">
          <span>{formatValue(value[0])}</span>
          <span>{formatValue(value[1])}</span>
        </div>
      </div>

      {showEnableLocation && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-full gap-1.5 text-xs text-600"
          onClick={locationAccess?.onEnable}
          disabled={locationAccess?.isEnabling}
        >
          <MapPin className="size-3.5" />
          {locationAccess?.isEnabling
            ? browse.filters.enablingLocation
            : browse.filters.enableLocation}
        </Button>
      )}
    </div>
  );
};
