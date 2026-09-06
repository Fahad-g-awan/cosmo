"use client";

import type { NodeProps } from "./types";

export const CosmediateReviews = ({ children }: NodeProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-10 max-lg:gap-8">
      {children}
    </div>
  );
};
