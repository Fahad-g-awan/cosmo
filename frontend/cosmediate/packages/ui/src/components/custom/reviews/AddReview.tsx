"use client";

import { useState } from "react";

import {
  Button,
  ButtonLoader,
  InfoMessage,
  Separator,
  Textarea,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { Star } from "lucide-react";

export const AddReview = ({
  handleReviewSubmit,
  setReviewText,
  reviewText,
  rating,
  setRating,
  isSubmitting,
  isRolePatient,
  canAddReview,
}: {
  handleReviewSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setReviewText: (text: string) => void;
  setRating: (rating: number) => void;
  rating: number;
  reviewText: string;
  isSubmitting: boolean;
  isRolePatient: boolean;
  isValidSession?: boolean;
  canAddReview: boolean;
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="w-full relative rounded-2xl">
      <form
        onSubmit={handleReviewSubmit}
        className={cn(
          "w-full rounded-2xl border border-stroke p-4",
          "flex items-center justify-between gap-2 max-lg:gap-4",
          "max-lg:flex-col max-lg:items-start",
        )}
        style={{
          boxShadow: "0px 4px 7px 0px rgba(23, 46, 121, 0.04)",
        }}
      >
        <div className="w-[80%] max-lg:w-full fex flex-col items-start justify-center gap-3">
          <Textarea
            className="w-full p-0 h-[80px] text-sm mb-3 placeholder:text-500 text-700 border-none rounded-md focus:outline-none outline-none"
            placeholder="Leave your review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          <div className="flex items-center justify-start gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <Star
                key={star}
                size={24}
                className={`cursor-pointer ${star <= (hoveredRating || rating) ? "text-primary-accent fill-primary-accent" : "text-primary-accent"}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              />
            ))}

            <Separator className="w-[20px]" />

            <span className="text-sm text-600 leading-4">
              {rating > 0 ? `${rating}/10` : "/10"}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-35 px-6 py-6 bg-900 text-white rounded-xl hover:bg-900/90 disabled:opacity-50"
        >
          {isSubmitting && <ButtonLoader />}
          {!isSubmitting && "Submit Review"}
        </Button>
      </form>

      {(!canAddReview || isSubmitting) && (
        <div className="w-full rounded-2xl inset-0 absolute bg-white/75"></div>
      )}
      {!canAddReview && (
        <div className="w-full absolute -bottom-10 items-center justify-center">
          <InfoMessage
            variant="warning"
            size="sm"
            message={
              isRolePatient
                ? "Please login to add reviews"
                : "Managers or Specailists can not add reviews"
            }
          />
        </div>
      )}
    </div>
  );
};
