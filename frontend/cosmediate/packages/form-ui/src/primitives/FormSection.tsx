"use client";

import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A container component for grouping form fields with a title and optional description
 * 
 * @example
 * <FormSection title="Personal Information">
 *   <ControlledTextField path="firstName" label="First Name" />
 *   <ControlledTextField path="lastName" label="Last Name" />
 * </FormSection>
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="pb-2 border-b">
          {title && (
            <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
