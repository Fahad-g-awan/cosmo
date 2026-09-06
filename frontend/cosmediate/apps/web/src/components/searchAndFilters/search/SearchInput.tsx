import React, { useState, useEffect } from "react";

import { cn } from "@cosmediate/ui/lib/utils";
import { Input } from "@cosmediate/ui";

import { SearchInputConfig } from "../types";

import { Search, X } from "lucide-react";

interface SearchInputProps {
  config: SearchInputConfig;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SearchInput = ({
  config,
  value,
  onChange,
  onKeyDown,
  onClear,
  className,
  disabled = false,
}: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value to parent on change (no debounce - parent controls when to apply)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue("");
    // onChange("");
    onClear?.();
  };

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between gap-3",
        "text-400 text-sm leading-[18px]",
        "max-xl:h-9 max-lg:h-11 max-xl:text-xs",
        className
      )}
    >
      {config.icon || <Search className="size-[18px] text-800" />}
      <Input
        type="text"
        placeholder={config.placeholder}
        value={localValue}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={cn("w-full border-none hover:border-none p-0")}
      />
      <div className="w-[10%] flex items-center justify-end">
        {localValue && (
          <X
            onClick={handleClear}
            className="w-4 h-4 text-300 hover:text-danger transition-all duration-200 cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};
