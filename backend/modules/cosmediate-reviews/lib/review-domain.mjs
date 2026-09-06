/** @param {string} targetEntity */
export const resolveTargetEntityType = (targetEntity) =>
  String(targetEntity ?? "")
    .toLowerCase()
    .includes("clinic")
    ? "CLINIC"
    : "SPECIALIST";

/** @param {string} authorRole */
export const resolveReplyAuthorRole = (authorRole) => {
  const normalized = String(authorRole ?? "").toLowerCase();
  if (normalized.includes("clinic")) return "CLINIC";
  if (normalized.includes("specialist")) return "SPECIALIST";
  return "ADMIN";
};

/** @param {"CLINIC"|"SPECIALIST"} targetEntityType */
export const resolveTargetDisplayName = (targetEntityType, foundEntity) =>
  targetEntityType === "CLINIC" ? foundEntity?.name : foundEntity?.fullName;

export const validateReviewOwnership = (
  review,
  authorId,
  targetEntityType,
  targetEntityId,
) => {
  const errors = [];

  if (review.authorId !== authorId) {
    errors.push("You are not authorized to modify this review");
  }
  if (review.targetEntityType !== targetEntityType) {
    errors.push("Target entity type mismatch");
  }
  if (review.targetEntityId !== targetEntityId) {
    errors.push("Target entity ID mismatch");
  }

  return { errors, ok: errors.length === 0 };
};

export const validateReplyOwnership = (
  reply,
  authorId,
  authorRole,
  reviewId,
  targetEntityType,
  targetEntityId,
) => {
  const errors = [];

  if (reply.authorId !== authorId) {
    errors.push("You are not authorized to modify this reply");
  }
  if (reply.authorRole !== authorRole) {
    errors.push("Author role mismatch");
  }
  if (reply.reviewId !== reviewId) {
    errors.push("Review ID mismatch");
  }
  if (reply.targetEntityType !== targetEntityType) {
    errors.push("Target entity type mismatch");
  }
  if (reply.targetEntityId !== targetEntityId) {
    errors.push("Target entity ID mismatch");
  }

  return { errors, ok: errors.length === 0 };
};
