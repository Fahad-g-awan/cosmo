import type { ReviewReplyStatusFilter } from "../types";

export const buildReplyStatusFilters = (
  replyStatus: ReviewReplyStatusFilter,
): Record<string, unknown> => {
  if (replyStatus === "incoming") {
    return { replyCount: [0, 0] };
  }
  if (replyStatus === "answered") {
    return { replyCountMin: 1 };
  }
  return {};
};

export const normalizeBrowseReviewFilters = (
  filters: Record<string, unknown> = {},
  replyStatus: ReviewReplyStatusFilter = "all",
): Record<string, unknown> => {
  const normalized: Record<string, unknown> = { ...filters };

  const createdAt = filters.createdAt;
  if (Array.isArray(createdAt) && createdAt.length === 2) {
    normalized.createdAt = createdAt;
  }

  const rating = filters.rating;
  if (Array.isArray(rating) && rating.length === 2) {
    normalized.rating = rating;
  }

  return {
    ...normalized,
    ...buildReplyStatusFilters(replyStatus),
  };
};
