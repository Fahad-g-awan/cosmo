"use client";

import React, { useState } from "react";

// import { Popover, PopoverContent, PopoverTrigger } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useTranslations } from "@cosmediate/i18n/client";

import { DateTimeSearchConfig } from "../types";
import { CalendarMinus2, ChevronDown } from "lucide-react";

interface DateTimeSearchProps {
  config?: DateTimeSearchConfig;
  value?: {
    dates?: Date[];
    timeRange?: [string, string];
  };
  placeholder?: string;
  onChange?: (value: { dates?: Date[]; timeRange?: [string, string] }) => void;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
}

export const DateTimeSearch = ({
  config,
  value,
  placeholder,
  onChange,
  onClear,
  className,
}: DateTimeSearchProps) => {
  const browse = useTranslations("browse");
  // const [isOpen, setIsOpen] = useState(false);

  // const formatDateRange = () => {
  //   if (!value.dates || value.dates.length === 0) {
  //     return "Select date";
  //   }

  //   if (value.dates.length === 1) {
  //     return value.dates[0]?.toLocaleDateString() || "Select date";
  //   }

  //   const firstDate = value.dates[0]?.toLocaleDateString();
  //   const lastDate = value.dates[value.dates.length - 1]?.toLocaleDateString();

  //   return `${firstDate} - ${lastDate}`;
  // };

  // const handleClear = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   onChange({ dates: [], timeRange: undefined });
  //   onClear?.();
  // };

  // TODO: Implement actual date/time picker
  // This is a placeholder for now
  return (
    <div
      className={cn(
        "w-full flex items-center justify-between gap-2",
        "text-400 text-sm leading-[18px]",
        "max-xl:h-9 max-lg:h-11 max-xl:text-xs",
        "pointer-events-none opacity-50",
        className
      )}
    >
      <div className="w-full flex items-center justify-start gap-3">
        <CalendarMinus2 className="size-4 text-800" />
        <span>{placeholder || browse.search.datetime}</span>
      </div>
      <ChevronDown className="size-5 text-300" />
    </div>
  );
};
