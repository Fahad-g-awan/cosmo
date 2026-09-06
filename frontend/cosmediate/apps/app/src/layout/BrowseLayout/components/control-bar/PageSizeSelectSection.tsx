import React from "react";

import { DropdownMenuLabel } from "@cosmediate/ui";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cosmediate/ui";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

const SELECT_TRIGGER_CLASS =
  "w-full mt-1 text-700 outline-none cursor-pointer hover:bg-cloud/80";

interface PageSizeSelectSectionProps {
  viewMode: "table" | "grid" | "list";
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export const PageSizeSelectSection = ({
  viewMode,
  pageSize,
  onPageSizeChange,
}: PageSizeSelectSectionProps) => {
  return (
    <>
      <DropdownMenuLabel className="text-700 text-sm">
        {viewMode === "table" ? "Rows Per Page" : "Items Per Page"}
      </DropdownMenuLabel>
      <Select
        value={String(pageSize)}
        onValueChange={(value) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger className={SELECT_TRIGGER_CLASS}>
          <SelectValue placeholder="Items per page" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem
                key={size}
                value={size.toString()}
                className="text-700 text-sm cursor-pointer"
              >
                {size}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};
