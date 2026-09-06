"use client";

import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";

interface HtmlViewerProps {
  html?: string | null;
  className?: string;
}

export default function HtmlViewer({ html, className }: HtmlViewerProps) {
  if (!html) return null;

  return (
    <div
      className={cn(
        "tiptap-viewer prose prose-sm dark:prose-invert max-w-none w-full",
        className
      )}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
