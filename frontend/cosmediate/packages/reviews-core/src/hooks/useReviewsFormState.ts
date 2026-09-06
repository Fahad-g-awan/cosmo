import { useState } from "react";

import { Review, ReviewReply } from "@cosmediate/type-utils";

interface SubmitingLoaderState {
  review?: boolean;
  reviewUpdate?: Record<string, boolean>;
  reply?: Record<string, boolean>;
  replyUpdate?: Record<string, boolean>;
}

interface ShowMoreLoaderState {
  reviews?: boolean;
  replies?: Record<string, boolean>;
}

/**
 * UI-only form/edit state. CRUD is handled by useReviewsData.
 */
export const useReviewsFormState = (
  reviews: Review[],
  replies: ReviewReply[],
) => {
  const [isSubmitting, setIsSubmitting] = useState<SubmitingLoaderState>();
  const [showMoreLoading, setShowMoreloading] = useState<ShowMoreLoaderState>();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [activeReviewEditId, setActiveReviewEditId] = useState<string | null>(
    null,
  );
  const [editReviewRating, setEditReviewRating] = useState<number>(0);
  const [editReviewText, setEditReviewText] = useState("");

  const [activeReplyEditId, setActiveReplyEditId] = useState<string | null>(
    null,
  );
  const [editReplyText, setEditReplyText] = useState("");

  const toggleReplyForm = (reviewId: string) => {
    setActiveReplyId(activeReplyId === reviewId ? null : reviewId);
    setReplyText("");
  };

  const toggleRepliesVisibility = (reviewId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleEditReview = (reviewId: string) => {
    if (reviewId === activeReviewEditId) {
      setActiveReviewEditId(null);
    } else {
      setActiveReviewEditId(reviewId);
      setEditReviewText(reviews.find((r) => r.id === reviewId)?.comment || "");
      setEditReviewRating(
        parseInt(reviews.find((r) => r.id === reviewId)?.rating || "0", 10),
      );
    }
  };

  const handleEditReply = (replyId: string) => {
    if (replyId === activeReplyEditId) {
      setActiveReplyEditId(null);
    } else {
      setActiveReplyEditId(replyId);
      setEditReplyText(replies.find((r) => r.id === replyId)?.comment || "");
    }
  };

  const showReplies = (reviewId: string, repliesCount: number) => {
    return expandedReplies[reviewId] && repliesCount > 0;
  };

  return {
    toggleReplyForm,
    toggleRepliesVisibility,
    handleEditReview,
    handleEditReply,
    showReplies,

    setActiveReviewEditId,
    setEditReviewRating,
    setEditReviewText,
    activeReviewEditId,
    editReviewRating,
    editReviewText,

    setEditReplyText,
    setActiveReplyEditId,
    editReplyText,
    activeReplyEditId,

    setReviewText,
    setRating,
    reviewText,
    rating,

    setReplyText,
    setActiveReplyId,
    setExpandedReplies,
    replyText,
    activeReplyId,
    expandedReplies,

    isSubmitting,
    setIsSubmitting,
    showMoreLoading,
    setShowMoreloading,
  };
};
