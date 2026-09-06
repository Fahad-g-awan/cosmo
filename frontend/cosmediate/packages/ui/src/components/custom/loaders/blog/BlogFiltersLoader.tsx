import { Skeleton } from "@cosmediate/ui/components/skeleton";
import React from "react";

export const BlogFiltersLoader = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-10">
      <Skeleton className="h-10 w-[70%] rounded-xl" />

      <div className="w-full flex flex-col items-start justify-start gap-3">
        <Skeleton className="h-4 w-[70%] rounded-xl" />
        <Skeleton className="h-4 w-[50%] rounded-xl" />
      </div>
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <Skeleton className="h-4 w-[70%] rounded-xl" />
        <Skeleton className="h-4 w-[50%] rounded-xl" />
      </div>
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <Skeleton className="h-4 w-[70%] rounded-xl" />
        <Skeleton className="h-4 w-[50%] rounded-xl" />
      </div>

      <div className="w-full flex max-lg:flex-col items-center justify-between gap-2">
        <Skeleton className="h-10 w-[50%] rounded-xl" />
        <Skeleton className="h-10 w-[50%] rounded-xl" />
      </div>
    </div>
  );
};
