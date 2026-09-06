import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";

export const TabHeader = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <div className="w-full sm:sticky top-0 bg-white z-50 flex flex-col items-start justify-center gap-1">
      <div
        className={cn(
          "w-full flex items-center justify-start capitalize",
          "text-700 font-bold text-[20px] leading-[24px] max-sm:text-[18px] max-sm:leading-[22px]"
        )}
      >
        {title}
      </div>
      <p className="text-sm text-400 mt-1">{description}</p>
    </div>
  );
};
