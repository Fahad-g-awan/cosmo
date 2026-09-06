"use client";

import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";
import { InfoMessage } from "@cosmediate/ui";

interface FieldErrorProps {
  error?: string;
  className?: string;
}

/**
 * Display a field error message
 *
 * @example
 * <FieldError error={errors.firstName} />
 */
export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;

  // return (
  //   <p
  //     role="alert"
  //     className={cn("text-xs text-red-500", className)}
  //   >
  //     {error}
  //   </p>
  // );

  return <InfoMessage message={error} variant="error" size="sm" />;
}
