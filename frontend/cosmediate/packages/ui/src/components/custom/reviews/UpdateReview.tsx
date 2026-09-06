"use client";

import { useState } from "react";

import { Button, ButtonLoader, Separator } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { Save, Star } from "lucide-react";

export const UpdateReview = ({
  handleSaveEditReview,
  setEditReviewRating,
  reviewId,
  activeReviewEditId,
  editReviewText,
  setEditReviewText,
  editReviewRating,
  isSubmitting,
}: {
  reviewId: string;
  activeReviewEditId: string | null;
  editReviewText: string;
  setEditReviewText: (text: string) => void;
  editReviewRating: number;
  setEditReviewRating: (rating: number) => void;
  handleSaveEditReview: (reviewId: string) => void;
  isSubmitting: boolean;
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  if (activeReviewEditId !== reviewId) return null;

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-stroke p-4 bg-white",
        "flex flex-col items-center justify-start gap-2",
      )}
    >
      <textarea
        className="w-full h-[40px] text-sm placeholder:text-500 text-700 border-none rounded-md focus:outline-none outline-none"
        value={editReviewText}
        onChange={(e) => setEditReviewText(e.target.value)}
      />

      <div className="w-full flex items-center justify-between gap-2 max-lg:flex-col max-lg:items-start max-lg:justify-center">
        <div className="flex items-center justify-start gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <Star
              key={star}
              className={`cursor-pointer size-3 ${star <= (hoveredRating || editReviewRating) ? "text-primary-accent fill-primary-accent" : "text-primary-accent"}`}
              onClick={() => setEditReviewRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            />
          ))}

          <Separator className="w-[20px]" />

          <span className="text-sm text-600 leading-4">
            {editReviewRating > 0 ? `${editReviewRating}/10` : "/10"}
          </span>
        </div>

        <Button
          type="button"
          onClick={() => handleSaveEditReview(reviewId)}
          disabled={isSubmitting}
          className="w-12 px-6 py-2 bg-900 text-white rounded-lg hover:bg-900/90 disabled:opacity-50"
        >
          {isSubmitting && <ButtonLoader />}
          {!isSubmitting && <Save className="size-4 text-white" />}
        </Button>
      </div>
    </div>
  );
};
