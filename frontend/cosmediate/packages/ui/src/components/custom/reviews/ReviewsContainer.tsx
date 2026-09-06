"use client";

import { Button } from "@cosmediate/ui";

import type { NodeProps } from "./types";
import { ShowMoreLoader } from "./ShowMoreLoader";

export const ReviewsContainer = ({
  children,
  showMoreReviews,
  showMoreButton,
  showMoreLoading,
}: NodeProps & {
  showMoreReviews: () => Promise<void>;
  showMoreButton: boolean;
  showMoreLoading: boolean;
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {children}

      {showMoreButton && !showMoreLoading && (
        <div className="w-full flex items-center justify-start mt-5">
          <Button
            type="button"
            variant={"ghost"}
            className="text-xs text-primary-accent hover:text-primary-accent-dark !bg-transparent !hover:bg-transparent !p-0"
            onClick={() => showMoreReviews()}
          >
            Show More
          </Button>
        </div>
      )}

      {showMoreLoading && <ShowMoreLoader />}
    </div>
  );
};
