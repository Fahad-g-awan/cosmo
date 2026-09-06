import * as React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg bg-transparent px-3 py-1 transition-[color,box-shadow] outline-none",
        "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground text-sm text-700",
        "border border-input focus-within:border-primary dark:bg-input/30",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
}

export { Input };
