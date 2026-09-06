import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";

export const ComingSoonBadge = () => {
  return (
    <div
      className={cn(
        "bg-primary-accent/15 flex gap-2 py-1 text-sm font-bold text-primary-accent",
        "rounded-full",
        "w-fit max-w-full px-5 text-center items-center",
        "mt-4 mb-4",
        "max-lg:mx-auto"
      )}
      // style={{
      //   background:
      //     "linear-gradient(90deg, hsla(186, 33%, 94%, 1) 0%, hsla(216, 41%, 79%, 1) 100%)",
      // }}
    >
      <span className="animate-pulse text-2xl">✧</span>
      <span className="text-primary-accent/70">Coming Soon</span>
    </div>
  );
};

export default ComingSoonBadge;
