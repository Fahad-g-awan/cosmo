"use client";

import type { NodeProps } from "./types";

export const ReplyGroup = ({ children }: NodeProps) => {
  return (
    <div className="w-full flex flex-col items-start justify-center gap-2">
      {children}
    </div>
  );
};
