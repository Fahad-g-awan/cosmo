"use client";

import React from "react";
import { format } from "date-fns";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cosmediate/ui/components/popover";
import { Calendar } from "@cosmediate/ui/components/calendar";
import { Button } from "@cosmediate/ui/components/button";
import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import { FilterLabel } from "./FilterLabel";

import { CiCalendar } from "react-icons/ci";
import { FiX } from "react-icons/fi";

interface RangeDateFilterConfig {
  id: string;
  label: string;
  description?: string;
  defaultValue: [Date | null, Date | null];
}

interface RangeDateFilterProps {
  config: RangeDateFilterConfig;
  value: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
}

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value === "string" && value) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

export const RangeDateFilter = ({
  config,
  value,
  onChange,
}: RangeDateFilterProps) => {
  const browse = useTranslations("browse");
  const fromDate = toDate(value[0]);
  const toDateValue = toDate(value[1]);

  const handleFromDateSelect = (date: Date | undefined) => {
    onChange([date || null, toDateValue]);
  };

  const handleToDateSelect = (date: Date | undefined) => {
    onChange([fromDate, date || null]);
  };

  const handleClear = () => {
    onChange([null, null]);
  };

  return (
    <div className="w-full flex flex-col items-start justify-start gap-3">
      <FilterLabel label={config.label} description={config.description} />

      <div
        className={cn(
          "w-full grid grid-cols-[1fr_20px] items-center justify-center gap-2",
        )}
      >
        <div
          className={cn(
            "w-full grid grid-cols-[1fr_10px_1fr] items-center justify-center gap-2",
          )}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fromDate && "text-muted-foreground",
                )}
              >
                <CiCalendar className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "PPP") : browse.filters.date.from}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate || undefined}
                onSelect={handleFromDateSelect}
              />
            </PopoverContent>
          </Popover>

          <div className="w-[10px] h-px bg-border" />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !toDateValue && "text-muted-foreground",
                )}
              >
                <CiCalendar className="mr-2 h-4 w-4" />
                {toDateValue
                  ? format(toDateValue, "PPP")
                  : browse.filters.date.to}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDateValue || undefined}
                onSelect={handleToDateSelect}
                disabled={(date) => (fromDate ? date < fromDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="text-400 hover:text-danger transition-colors cursor-pointer"
          title={browse.filters.clearFilterTitle}
        >
          <FiX className="size-4" />
        </button>
      </div>
    </div>
  );
};
