import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";
import { FilterLabel } from "./FilterLabel";
import { FiX } from "react-icons/fi";
import { Calendar } from "@cosmediate/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cosmediate/ui/components/popover";
import { Button } from "@cosmediate/ui/components/button";
import { format } from "date-fns";
import { CiCalendar } from "react-icons/ci";

interface RangeDateFilterConfig {
  type: "dateRange";
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue: [Date | null, Date | null];
}

interface RangeDateFilterProps {
  config: RangeDateFilterConfig;
  value: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
}

export const RangeDateFilter = ({
  config,
  value,
  onChange,
}: RangeDateFilterProps) => {
  const handleFromDateSelect = (date: Date | undefined) => {
    onChange([date || null, value[1]]);
  };

  const handleToDateSelect = (date: Date | undefined) => {
    onChange([value[0], date || null]);
  };

  const handleClear = () => {
    onChange([null, null]);
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
          {/* From Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value[0] && "text-muted-foreground"
                )}
              >
                <CiCalendar className="mr-2 h-4 w-4" />
                {value[0] ? format(value[0], "PPP") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value[0] || undefined}
                onSelect={handleFromDateSelect}
              />
            </PopoverContent>
          </Popover>

          <div className="w-[10px] h-px bg-border" />

          {/* To Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value[1] && "text-muted-foreground"
                )}
              >
                <CiCalendar className="mr-2 h-4 w-4" />
                {value[1] ? format(value[1], "PPP") : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value[1] || undefined}
                onSelect={handleToDateSelect}
                disabled={(date) => (value[0] ? date < value[0] : false)}
              />
            </PopoverContent>
          </Popover>
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
