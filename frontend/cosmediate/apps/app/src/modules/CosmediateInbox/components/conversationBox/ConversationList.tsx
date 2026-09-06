import React from "react";

import { ScrollArea } from "@cosmediate/ui/components/scroll-area";
import { cn } from "@cosmediate/ui/lib/utils";

const ConversationList = ({ children }: { children: React.ReactNode }) => {
  return (
    <ScrollArea
      showThumb
      className="w-[30%] max-lg:w-full h-[90dvh] bg-gray-card border-r border-stroke"
    >
      <div
        className={cn(
          "w-full min-h-full flex flex-col items-start justify-start overflow-hidden"
        )}
      >
        {children}
      </div>
    </ScrollArea>
  );
};

export default ConversationList;
