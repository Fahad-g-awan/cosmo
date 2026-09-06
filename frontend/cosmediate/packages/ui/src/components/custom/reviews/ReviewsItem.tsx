"use client";

import type React from "react";

import { Separator } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

export const ReviewsItem = ({
  children,
  index,
  containerClassName,
  innerClassName,
}: {
  children: React.ReactNode;
  index: number;
  containerClassName?: string;
  innerClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-start gap-6",
        containerClassName,
      )}
    >
      {index !== 0 && <Separator className="w-full" />}

      <div
        className={cn(
          "w-full flex items-start justify-start gap-2",
          "max-sm:flex-col",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
};
