"use client";

import { MoreArticlesLoader, Skeleton, SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

export const BlogDetailsPageLoader = () => {
  return (
    <SiteContainer>
      <div
        className={cn(
          "container flex flex-col items-center justify-start gap-5"
        )}
      >
        <Skeleton className="h-[100px] w-full rounded-xl" />

        <div className="w-full flex items-start justify-start gap-5 max-lg:flex-col">
          <div className="w-[75%] max-lg:w-full flex  flex-col gap-2 cursor-pointer ">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[50%]" />
            <Skeleton className="h-[400px] max-sm:h-[300px] w-full rounded-xl" />
            <Skeleton className="h-3 w-[10%] mb-5" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-[70%]" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-[300px]" />
            </div>
          </div>

          <div className="w-[25%] max-lg:w-full flex flex-col items-start justify-start">
            <MoreArticlesLoader />
          </div>
        </div>
      </div>
    </SiteContainer>
  );
};
