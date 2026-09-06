"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@cosmediate/ui";
import { Calendar } from "@cosmediate/ui";
import { Input } from "@cosmediate/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

interface DatePickerProps {
  value?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  containerClassName?: string;
  triggerClasses?: string;
  iconClassName?: string;
  popoverClassName?: string;
  calendarClassName?: string;
}

export const DatePicker = ({
  value: controlledValue,
  onChange,
  placeholder = "Select a date",
  disabled = false,
  id = "date",
  containerClassName,
  triggerClasses,
  iconClassName,
  popoverClassName,
  calendarClassName,
}: DatePickerProps) => {
  const isControlled = controlledValue !== undefined || onChange !== undefined;

  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    undefined
  );

  const date = isControlled ? controlledValue : internalDate;

  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [inputValue, setInputValue] = React.useState(formatDate(date));

  React.useEffect(() => {
    setInputValue(formatDate(date));
    if (date) {
      setMonth(date);
    }
  }, [date]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (!isControlled) {
      setInternalDate(newDate);
    }
    onChange?.(newDate);
  };

  const hasDate = date !== undefined;

  return (
    <div className={cn("relative w-full flex gap-2", containerClassName)}>
      <Input
        id={id}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        data-date-selected={hasDate}
        className={cn("bg-background pr-10", triggerClasses)}
        onChange={(e) => {
          const parsed = new Date(e.target.value);
          setInputValue(e.target.value);
          if (isValidDate(parsed)) {
            handleDateChange(parsed);
            setMonth(parsed);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={`${id}-picker`}
            variant="ghost"
            disabled={disabled}
            className={cn(
              "absolute top-1/2 right-2 size-6 -translate-y-1/2",
              iconClassName
            )}
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-auto overflow-hidden p-0", popoverClassName)}
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            className={calendarClassName}
            onSelect={(newDate) => {
              handleDateChange(newDate);
              setInputValue(formatDate(newDate));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
