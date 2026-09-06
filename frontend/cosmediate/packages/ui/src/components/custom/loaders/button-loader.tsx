"use client";

import { LoaderCircle } from "lucide-react";
import { cn } from "@cosmediate/ui/lib/utils";

export const ButtonLoader = ({
  className,
  variant = "dark", // 'dark' = white text, 'light' = dark text
}: {
  className?: string;
  variant?: "dark" | "light";
}) => {
  const textColor = variant === "light" ? "text-800" : "text-white";

  return (
    <span>
      <LoaderCircle
        className={cn("animate-spin size-5", textColor, className)}
      />
    </span>
  );
};
