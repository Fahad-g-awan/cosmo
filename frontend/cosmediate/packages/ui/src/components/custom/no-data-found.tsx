"use client";

import { cn } from "@cosmediate/ui/lib/utils";
import { SearchX } from "lucide-react";

export const NoDataFound = ({
  message = "No data found",
  description,
  className,
  icon,
}: {
  message?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center gap-4 py-16 px-6",
        className
      )}
    >
      <div className="flex items-center justify-center size-16 rounded-full bg-ghost-blue-2">
        {icon || <SearchX className="size-7 text-300" strokeWidth={1.5} />}
      </div>
      <div className="flex flex-col items-center gap-1.5 max-w-xs text-center">
        <p className="text-sm font-semibold text-700">{message}</p>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
