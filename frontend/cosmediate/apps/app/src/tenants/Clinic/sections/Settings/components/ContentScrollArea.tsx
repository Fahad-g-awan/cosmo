import React from "react";

import { ScrollArea } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

const ContentScrollArea = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <ScrollArea
      className={cn(
        "w-full max-w-[700px]",
        "h-[75dvh] max-lg:h-[75dvh] max-sm:h-[70dvh]",
        className
      )}
    >
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-start p-2"
        )}
      >
        {children}
      </div>
    </ScrollArea>
  );
};

export default ContentScrollArea;
