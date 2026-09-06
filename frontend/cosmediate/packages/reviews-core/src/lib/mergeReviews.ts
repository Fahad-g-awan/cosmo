import type { Review } from "@cosmediate/type-utils";

interface MergeReviewsParams {
  existing: Review[];
  loaded: Review[];
  socketEvents: Review[];
}

export const mergeReviews = ({
  existing,
  loaded,
  socketEvents,
}: MergeReviewsParams): Review[] => {
  const map = new Map<string, Review>();

  existing.forEach((r) => map.set(r.id, r));
  loaded.forEach((r) => map.set(r.id, r));
  socketEvents.forEach((r) => map.set(r.id, r));

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};
