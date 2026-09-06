import * as React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-16 w-full flex field-sizing-content rounded-lg bg-transparent px-3 py-2 transition-[color,box-shadow] outline-none",
        "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground text-sm text-700",
        "border border-input focus-within:border-primary aria-invalid:border-destructive",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "dark:aria-invalid:ring-destructive/40 dark:bg-input/30",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
