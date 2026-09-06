"use client";

import { IoIosArrowDown } from "react-icons/io";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

export const ReviewActions = ({
  toggleRepliesVisibility,
  handleEditReview,
  toggleReplyForm,
  showReplies,
  reviewId,
  activeReplyId,
  activeReviewEditId,
  expandedReplies,
  showReplyToggle,
  repliesCount,
  showReplyAction,
}: {
  toggleRepliesVisibility: (reviewId: string) => void;
  handleEditReview: (reviewId: string) => void;
  toggleReplyForm: (reviewId: string) => void;
  showReplies: (reviewId: string) => void;
  reviewId: string;
  activeReplyId: string | null;
  activeReviewEditId: string | null;
  expandedReplies: Record<string, boolean>;
  showReplyToggle: boolean;
  repliesCount: number;
  showReplyAction: boolean;
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-2">
      {activeReviewEditId === reviewId && (
        <Button
          type="button"
          variant={"ghost"}
          className="text-xs text-primary-accent hover:text-primary-accent-dark !bg-transparent !hover:bg-transparent !p-0"
          onClick={() => handleEditReview(reviewId)}
        >
          Cancel
        </Button>
      )}

      <div className="flex items-center justify-end gap-2">
        {showReplyAction && (
          <Button
            type="button"
            variant={"ghost"}
            className="text-xs text-primary-accent hover:text-primary-accent-dark !bg-transparent !hover:bg-transparent !p-0"
            onClick={() => toggleReplyForm(reviewId)}
          >
            {activeReplyId === reviewId ? "Cancel Reply" : "Reply"}
          </Button>
        )}

        {showReplyToggle && (
          <Button
            type="button"
            variant={"ghost"}
            onClick={() => {
              toggleRepliesVisibility(reviewId);
              showReplies(reviewId);
            }}
            className="text-xs text-600 hover:text-800 !bg-transparent !hover:bg-transparent !p-0 flex items-center gap-1"
          >
            <IoIosArrowDown
              className={cn(
                "size-3 transition-all duration-300",
                expandedReplies[reviewId] ? "rotate-180" : "rotate-0",
              )}
            />
            {`Replies (${repliesCount})`}
          </Button>
        )}
      </div>
    </div>
  );
};
