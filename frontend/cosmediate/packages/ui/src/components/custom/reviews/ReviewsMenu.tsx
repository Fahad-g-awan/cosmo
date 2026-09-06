"use client";

import { cn } from "@cosmediate/ui/lib/utils";
import { Star } from "lucide-react";

import { ReviewActionMenu } from "./ReviewActionMenu";

export const ReviewsMenu = ({
  handleDeleteReview,
  handleEditReview,
  rating,
  reviewId,
  className,
  isAuthor,
  showMenu,
}: {
  handleDeleteReview: (reviewId: string) => void;
  handleEditReview: (reviewId: string) => void;
  rating: string;
  reviewId: string;
  className?: string;
  isAuthor: boolean;
  showMenu?: boolean;
}) => {
  return (
    <div
      className={cn(
        "w-[10%] flex flex-col items-center justify-end gap-3",
        "max-sm:flex-row max-sm:w-[30%]",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-1">
        <Star size={16} className={"text-primary-accent"} />
        <span className="text-xs text-gray-600">{rating}</span>
      </div>

      {isAuthor && showMenu && (
        <ReviewActionMenu
          handleEdit={() => handleEditReview(reviewId)}
          handleDelete={() => handleDeleteReview(reviewId)}
        />
      )}
    </div>
  );
};
