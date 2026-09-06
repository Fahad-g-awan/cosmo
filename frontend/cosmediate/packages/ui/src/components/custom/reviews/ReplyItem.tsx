"use client";

import type React from "react";

export const ReplyItem = ({
  children,
  replyId,
}: {
  children: React.ReactNode;
  replyId: string;
}) => {
  return (
    <div
      key={replyId}
      className="w-full bg-ghost-blue-2 rounded-xl p-4 flex items-start justify-start gap-2"
    >
      {children}
    </div>
  );
};
