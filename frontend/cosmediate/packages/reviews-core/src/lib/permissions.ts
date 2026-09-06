import type { UserRole } from "@cosmediate/type-utils";

import type { ReviewsSurface } from "../types";

export interface ReviewsPermissions {
  canAddReview: boolean;
  canEditOwnReview: boolean;
  canDeleteOwnReview: boolean;
  canAddReply: boolean;
  canEditReply: boolean;
  canDeleteReply: boolean;
}

export const getReviewsPermissions = ({
  surface,
  role,
}: {
  surface: ReviewsSurface;
  role: UserRole | null;
}): ReviewsPermissions => {
  if (surface === "web") {
    return {
      canAddReview: role === "PATIENT",
      canEditOwnReview: role === "PATIENT",
      canDeleteOwnReview: role === "PATIENT",
      canAddReply:
        role === "MANAGER" || role === "SPECIALIST" || role === "ADMIN",
      canEditReply:
        role === "MANAGER" || role === "SPECIALIST" || role === "ADMIN",
      canDeleteReply:
        role === "MANAGER" || role === "SPECIALIST" || role === "ADMIN",
    };
  }

  if (surface === "dashboard" || surface === "analytics-preview") {
    const staffReply =
      role === "MANAGER" || role === "SPECIALIST" || role === "ADMIN";
    return {
      canAddReview: false,
      canEditOwnReview: false,
      canDeleteOwnReview: false,
      canAddReply: staffReply,
      canEditReply: staffReply,
      canDeleteReply: staffReply,
    };
  }

  return {
    canAddReview: false,
    canEditOwnReview: false,
    canDeleteOwnReview: false,
    canAddReply: false,
    canEditReply: false,
    canDeleteReply: false,
  };
};
