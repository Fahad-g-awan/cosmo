import { Search } from "lucide-react";
import React from "react";

import { Input } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

export const MainSearch = ({
  className,
  onChange,
  value,
  onKeyDown,
}: {
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-self-center",
        "border focus-within:border-primary-accent rounded-lg px-2",
        className
      )}
    >
      <Search className="size-4 text-400" />
      <Input
        type="search"
        className="w-full text-sm border-none bg-transparent py-2"
        placeholder="Search"
        onChange={onChange}
        value={value}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
