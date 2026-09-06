"use client";

import type { Clinic, Specialist } from "@cosmediate/type-utils";
import type { UserRole } from "@cosmediate/type-utils/auth";
import { Toaster } from "@cosmediate/ui";
import {
  resolveReplyAuthorRole,
  useReviewsFormState,
  type ReviewsPermissions,
} from "@cosmediate/reviews-core";

import { useDialog } from "@app/context/dialog/DialogProvider";
import type { AppReviewsApi } from "@app/hooks/useReviewsApi";

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
  reviewsApi: AppReviewsApi;
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
    replyText,
    activeReplyEditId,
    editReplyText,
    expandedReplies,
    setReplyText,
    setActiveReplyId,
    setEditReplyText,
    setActiveReplyEditId,
    setIsSubmitting,
    setShowMoreloading,
  } = form;

  const {
    handleFetchReviewsApi,
    handleFetchReviewRepliesApi,
    handleAddReplyApi,
    handleUpdateReplyApi,
    handleDeleteReplyApi,
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
    handleReplySubmit,
    handleSaveReplyEdit,
    handleDeleteReply,
  };
};
