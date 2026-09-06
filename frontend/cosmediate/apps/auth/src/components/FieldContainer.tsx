import { cn } from "@cosmediate/ui/lib/utils";
import React from "react";

const FieldContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-center gap-1.5",
        className
      )}
    >
      {children}
    </div>
  );
};

export default FieldContainer;
