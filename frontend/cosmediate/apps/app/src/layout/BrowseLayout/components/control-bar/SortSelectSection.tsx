import React from "react";

import type { SortOption } from "@cosmediate/browse-manager";
import {
  DropdownMenuLabel,
} from "@cosmediate/ui";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cosmediate/ui";

const SELECT_TRIGGER_CLASS =
  "w-full mt-1 text-700 outline-none cursor-pointer hover:bg-cloud/80";

interface SortSelectSectionProps {
  sortOptions: SortOption[];
  currentSortValue: string;
  disabled?: boolean;
  onSortChange: (value: string) => void;
}

export const SortSelectSection = ({
  sortOptions,
  currentSortValue,
  disabled = false,
  onSortChange,
}: SortSelectSectionProps) => {
  if (sortOptions.length === 0) return null;

  return (
    <>
      <DropdownMenuLabel className="text-700 text-sm">Sort by</DropdownMenuLabel>
      <Select
        value={currentSortValue}
        onValueChange={onSortChange}
        disabled={disabled}
      >
        <SelectTrigger className={SELECT_TRIGGER_CLASS}>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sortOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-700 text-sm cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};
