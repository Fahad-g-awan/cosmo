import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

export interface ToggleMenuItem {
  value: string;
  label: string;
  icon?: React.ReactElement;
}

export interface ToggleMenuProps {
  items: ToggleMenuItem[];
  value: string;
  onChange: (value: any) => void;
  className?: string;
}

export const ToggleMenu = ({
  items,
  value,
  onChange,
  className,
}: ToggleMenuProps) => {
  const activeIndex = items.findIndex((item) => item.value === value);

  return (
    <div
      className={cn(
        "relative grid bg-ghost-white rounded-xl p-1 gap-2",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
    >
      <div
        className={cn(
          "absolute inset-y-1 rounded-[11px] bg-white shadow-sm transition-transform duration-200"
        )}
        style={{
          width: `calc(${100 / items.length}% - 0.25rem)`,
          left: "0.25rem",
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
      />

      {items.map((item) => (
        <Button
          key={item.value}
          variant="ghost"
          type="button"
          size="sm"
          onClick={() => onChange(item.value)}
          className={cn(
            "relative z-10 flex items-center justify-center gap-0.5 py-2.5 px-1.5 rounded-[11px] hover:bg-white/70 min-w-0 h-auto whitespace-normal"
            // value === item.value ? "text-700 hover:text-900" : "text-white"
          )}
        >
          {item.icon}
          <span className="text-xs text-600 leading-tight break-words text-center w-full">
            {item.label}
          </span>
        </Button>
      ))}
    </div>
  );
};
