"use client";

import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";

interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * A responsive grid layout for form fields
 *
 * @example
 * <FormGrid columns={2}>
 *   <ControlledTextField path="firstName" label="First Name" />
 *   <ControlledTextField path="lastName" label="Last Name" />
 * </FormGrid>
 */
export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("w-full grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}
