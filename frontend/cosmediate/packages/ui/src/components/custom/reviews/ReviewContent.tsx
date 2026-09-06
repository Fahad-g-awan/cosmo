"use client";

import { cn } from "@cosmediate/ui/lib/utils";

import type { NodeProps } from "./types";

export const ReviewContent = ({
  children,
  className,
}: NodeProps & { className?: string }) => {
  return (
    <div
      className={cn(
        "w-[70%] max-sm:w-full flex-col items-center justify-start space-y-3",
        className,
      )}
    >
      {children}
    </div>
  );
};
