"use client";

import type React from "react";

import type { Clinic, Specialist } from "@cosmediate/type-utils";
import type { UserRole } from "@cosmediate/type-utils/auth";
import { Toaster } from "@cosmediate/ui";
import {
  resolveReplyAuthorRole,
  useReviewsFormState,
  type ReviewsPermissions,
} from "@cosmediate/reviews-core";

import { useDialog } from "@web/context/dialog/DialogProvider";
import type { WebReviewsApi } from "@web/hooks/useReviewsApi";

type TargetEntityType = "CLINIC" | "SPECIALIST";
type FormState = ReturnType<typeof useReviewsFormState>;

interface SessionUser {
  profileId: string;
  role?: UserRole | null;
}

interface UseEntityReviewHandlersParams {
  entity: Clinic | Specialist;
  targetEntityType: TargetEntityType;
  sessionUser: SessionUser | null | undefined;
  userRole: UserRole | null;
  permissions: ReviewsPermissions;
  form: FormState;
  reviewsApi: WebReviewsApi;
}

export const useEntityReviewHandlers = ({
  entity,
  targetEntityType,
  sessionUser,
  userRole,
  permissions,
  form,
  reviewsApi,
}: UseEntityReviewHandlersParams) => {
  const { openDialog } = useDialog();
  const {
    reviewText,
    rating,
    editReviewText,
    editReviewRating,
    activeReviewEditId,
    replyText,
    activeReplyEditId,
    editReplyText,
    expandedReplies,
    setReviewText,
    setRating,
    setEditReviewText,
    setEditReviewRating,
    setActiveReviewEditId,
    setReplyText,
    setActiveReplyId,
    setEditReplyText,
    setActiveReplyEditId,
    setIsSubmitting,
    setShowMoreloading,
  } = form;

  const {
    handleFetchReviewsApi,
    handleAddReviewApi,
    handleUpdateReviewApi,
    handleDeleteReviewApi,
    handleFetchReviewRepliesApi,
    handleAddReplyApi,
    handleUpdateReplyApi,
    handleDeleteReplyApi,
    allReviews,
    allReviewReplies,
    reviewReplies,
  } = reviewsApi;

  const entityScope = {
    targetEntityId: entity.id,
    targetEntity: entity.entityType,
  };

  const handleSetReviewsFromApi = async () => {
    setShowMoreloading((prev) => ({ ...prev, reviews: true }));
    await handleFetchReviewsApi({
      targetEntityId: entity.id,
      targetEntityType,
    });
    setShowMoreloading((prev) => ({ ...prev, reviews: false }));
  };

  const handleFetchReviewRepliesFromApi = async (
    reviewId: string,
    fetch?: boolean,
  ) => {
    if (
      (expandedReplies[reviewId] ||
        (reviewReplies?.[reviewId] || []).length > 0) &&
      !fetch
    ) {
      return;
    }

    if ((reviewReplies?.[reviewId] || []).length > 0) {
      setShowMoreloading((prev) => ({
        ...prev,
        replies: { ...prev?.replies, [reviewId]: true },
      }));
    }

    await handleFetchReviewRepliesApi({
      reviewId,
      targetEntityId: entity.id,
      targetEntityType,
    });

    setShowMoreloading((prev) => ({
      ...prev,
      replies: { ...prev?.replies, [reviewId]: false },
    }));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionUser) {
      Toaster("Please log in to add a review", "error");
      return;
    }

    if (!permissions.canAddReview) {
      Toaster("You are not authorized to add a review", "error");
      return;
    }

    if (!reviewText.trim()) {
      Toaster("Please add review", "error");
      return;
    }

    if (rating === 0) {
      Toaster("Please select rating", "error");
      return;
    }

    try {
      setIsSubmitting((prev) => ({ ...prev, review: true }));

      const isSuccess = await handleAddReviewApi({
        comment: reviewText,
        rating,
        ...entityScope,
        authorId: sessionUser.profileId,
        authorRole: "PATIENT",
      });

      if (isSuccess) {
        setReviewText("");
        setRating(0);
        Toaster("Review submitted successfully.", "success");
      } else {
        Toaster("Something went wrong, please try again.", "error");
      }
    } catch {
      Toaster("Something went wrong, please try again.", "error");
    } finally {
      setIsSubmitting((prev) => ({ ...prev, review: false }));
    }
  };

  const handleSaveEditReview = async (reviewId: string) => {
    if (!sessionUser) {
      Toaster("Please login to submit a review", "error");
      return;
    }

    if (!permissions.canEditOwnReview) {
      Toaster("You are not authorized to update a review", "error");
      return;
    }

    if (!editReviewText.trim()) {
      Toaster("Please add review", "error");
      return;
    }

    if (editReviewRating === 0) {
      Toaster("Please select a rating", "error");
      return;
    }

    if (reviewId !== activeReviewEditId) {
      Toaster("Something went wrong, please reload and try again", "error");
      return;
    }

    const review = allReviews.find((r) => r.id === reviewId);

    if (review && review.authorId !== sessionUser.profileId) {
      Toaster("Unauthorized access, permission denied.", "error");
      return;
    }

    try {
      setIsSubmitting((prev) => ({
        ...prev,
        reviewUpdate: { ...(prev?.reviewUpdate || {}), [reviewId]: true },
      }));

      const isUpdated = await handleUpdateReviewApi({
        id: reviewId,
        comment: editReviewText,
        rating: editReviewRating,
        ...entityScope,
        authorId: sessionUser.profileId,
        authorRole: "PATIENT",
      });

      if (isUpdated) {
        setEditReviewText("");
        setEditReviewRating(0);
        setActiveReviewEditId(null);
        Toaster("Review data updated successfully", "success");
      } else {
        Toaster("Something went wrong, please reload and try again", "error");
      }
    } catch {
      Toaster("Something went wrong, please try again", "error");
    } finally {
      setIsSubmitting((prev) => ({
        ...prev,
        reviewUpdate: { ...(prev?.reviewUpdate || {}), [reviewId]: false },
      }));
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!sessionUser) {
      Toaster("Please login to delete review", "error");
      return;
    }

    if (!permissions.canDeleteOwnReview) {
      Toaster("You are not authorized to delete a review", "error");
      return;
    }

    const review = allReviews.find((r) => r.id === reviewId);

    if (review && review.authorId !== sessionUser.profileId) {
      Toaster("Unauthorized access, permission denied.", "error");
      return;
    }

    openDialog({
      dialogType: "delete",
      payload: {
        primaryText: "Delete Review",
        closeOnConfirm: true,
        onConfirm: async () => {
          const isDeleted = await handleDeleteReviewApi({
            id: reviewId,
            ...entityScope,
            authorId: sessionUser.profileId,
            authorRole: "PATIENT",
          });

          Toaster(
            isDeleted
              ? "Review data deleted successfully"
              : "Something went wrong, please try again.",
            isDeleted ? "success" : "error",
          );
        },
      },
    });
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!sessionUser) {
      Toaster("Please login to reply", "error");
      return;
    }

    if (!permissions.canAddReply) {
      Toaster("You are not authorized to reply", "error");
      return;
    }

    if (!replyText.trim()) {
      Toaster("Please add reply", "error");
      return;
    }

    try {
      setIsSubmitting((prev) => ({
        ...prev,
        reply: { ...(prev?.reply || {}), [reviewId]: true },
      }));

      const isSuccess = await handleAddReplyApi({
        reviewId,
        comment: replyText,
        ...entityScope,
        authorId: sessionUser.profileId,
        authorRole: resolveReplyAuthorRole(userRole),
      });

      if (isSuccess) {
        setReplyText("");
        setActiveReplyId(null);
        Toaster("Reply added successfully", "success");
      } else {
        Toaster("Something went wrong, please try again.", "error");
      }
    } catch {
      Toaster("Something went wrong, please try again.", "error");
    } finally {
      setIsSubmitting((prev) => ({
        ...prev,
        reply: { ...(prev?.reply || {}), [reviewId]: false },
      }));
    }
  };

  const handleSaveReplyEdit = async (replyId: string, reviewId: string) => {
    if (!sessionUser) {
      Toaster("Please login to update reply data.", "error");
      return;
    }

    if (!permissions.canEditReply) {
      Toaster("You are not authorized to update a reply", "error");
      return;
    }

    if (!editReplyText.trim()) {
      Toaster("Please add reply text.", "error");
      return;
    }

    if (!replyId || !activeReplyEditId || replyId !== activeReplyEditId) {
      Toaster("Something went wrong, please reload the page.", "error");
      return;
    }

    const reviewReply = allReviewReplies.find((r) => r.id === replyId);

    if (reviewReply && reviewReply.authorId !== sessionUser.profileId) {
      Toaster("Unauthorized access, permission denied.", "error");
      return;
    }

    try {
      setIsSubmitting((prev) => ({
        ...prev,
        replyUpdate: { ...(prev?.replyUpdate || {}), [replyId]: true },
      }));

      const isUpdated = await handleUpdateReplyApi({
        id: replyId,
        reviewId,
        comment: editReplyText,
        ...entityScope,
        authorId: sessionUser.profileId,
        authorRole: resolveReplyAuthorRole(userRole),
      });

      if (isUpdated) {
        setEditReplyText("");
        setActiveReplyEditId(null);
        Toaster("Reply data updated successfully", "success");
      } else {
        Toaster("Something went wrong, please try again.", "error");
      }
    } catch {
      Toaster("Something went wrong, please try again.", "error");
    } finally {
      setIsSubmitting((prev) => ({
        ...prev,
        replyUpdate: { ...(prev?.replyUpdate || {}), [replyId]: false },
      }));
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!sessionUser) {
      Toaster("Please login to delete reply", "error");
      return;
    }

    if (!replyId) {
      Toaster("Something went wrong, please reload and try again.", "error");
      return;
    }

    if (!permissions.canDeleteReply) {
      Toaster("You are not authorized to delete a reply", "error");
      return;
    }

    const reviewReply = allReviewReplies.find((r) => r.id === replyId);

    if (reviewReply && reviewReply.authorId !== sessionUser.profileId) {
      Toaster("Unauthorized access, permission denied.", "error");
      return;
    }

    openDialog({
      dialogType: "delete",
      payload: {
        primaryText: "Delete Review Reply",
        closeOnConfirm: true,
        onConfirm: async () => {
          const isDeleted = await handleDeleteReplyApi({
            id: replyId,
            ...entityScope,
            authorId: sessionUser.profileId,
            authorRole: resolveReplyAuthorRole(userRole),
          });

          Toaster(
            isDeleted
              ? "Review reply data deleted successfully"
              : "Something went wrong, please try again.",
            isDeleted ? "success" : "error",
          );
        },
      },
    });
  };

  return {
    handleSetReviewsFromApi,
    handleFetchReviewRepliesFromApi,
    handleReviewSubmit,
    handleSaveEditReview,
    handleDeleteReview,
    handleReplySubmit,
    handleSaveReplyEdit,
    handleDeleteReply,
  };
};
