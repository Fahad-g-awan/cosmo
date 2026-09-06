import type { ReviewReply } from "@cosmediate/type-utils";

interface MergeReviewRepliesParams {
  existing: ReviewReply[];
  loaded: ReviewReply[];
  socketEvents: ReviewReply[];
}

export const mergeReviewReplies = ({
  existing,
  loaded,
  socketEvents,
}: MergeReviewRepliesParams): ReviewReply[] => {
  const map = new Map<string, ReviewReply>();

  existing.forEach((r) => map.set(r.id, r));
  loaded.forEach((r) => map.set(r.id, r));
  socketEvents.forEach((r) => map.set(r.id, r));

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};
