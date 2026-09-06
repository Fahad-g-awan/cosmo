"use client";

import type React from "react";

import { Button } from "@cosmediate/ui";

import { ShowMoreLoader } from "./ShowMoreLoader";

export const RepliesContainer = ({
  children,
  showMoreReplies,
  showMoreButton,
  reviewId,
  showMoreLoading,
}: {
  children: React.ReactNode;
  showMoreReplies: (reviewId: string) => void;
  showMoreButton: boolean;
  reviewId: string;
  showMoreLoading: boolean;
}) => {
  return (
    <div className="pl-6 border-l-2 border-gray-200 max-sm:border-0 max-sm:pl-0 w-full flex flex-col items-start justify-start gap-3">
      {children}

      {showMoreButton && !showMoreLoading && (
        <Button
          type="button"
          variant={"ghost"}
          className="text-xs text-primary-accent hover:text-primary-accent-dark !bg-transparent !hover:bg-transparent !p-0"
          onClick={() => showMoreReplies(reviewId)}
        >
          Show More
        </Button>
      )}

      {showMoreLoading && <ShowMoreLoader />}
    </div>
  );
};
