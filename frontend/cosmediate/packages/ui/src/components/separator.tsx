import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const Separator: React.FC<SeparatorProps> = ({
  className,
  orientation = "horizontal",
}) => {
  return (
    <div
      className={cn(
        "bg-200 block",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      role="separator"
    />
  );
};

export { Separator };
