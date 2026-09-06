"use client";

import { cn } from "@cosmediate/ui/lib/utils";
import React from "react";

export const SiteContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full container flex flex-col items-center justify-start",
        "px-14 max-lg:px-6 max-sm:px-4",
        className
      )}
    >
      {children}
    </div>
  );
};
