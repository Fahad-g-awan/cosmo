import type { Review, ReviewReply } from "@cosmediate/type-utils";

export type SocketAction = "ADD" | "UPDATE" | "DELETE";

export type ReviewSocketHandler = (payload: {
  action: SocketAction;
  data: Review;
}) => void;

export type ReviewReplySocketHandler = (payload: {
  action: SocketAction;
  data: ReviewReply;
}) => void;

export const SOCKET_EVENTS = {
  REVIEW_ADDED: "REVIEW_ADDED",
  REVIEW_UPDATED: "REVIEW_UPDATED",
  REVIEW_DELETED: "REVIEW_DELETED",
  REVIEW_REPLY_ADDED: "REVIEW_REPLY_ADDED",
  REVIEW_REPLY_UPDATED: "REVIEW_REPLY_UPDATED",
  REVIEW_REPLY_DELETED: "REVIEW_REPLY_DELETED",
  NEW_CHAT: "new_chat",
} as const;

export type SocketEventType =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

type ReviewListener = ReviewSocketHandler;
type ReviewReplyListener = ReviewReplySocketHandler;

const reviewListeners = new Set<ReviewListener>();
const reviewReplyListeners = new Set<ReviewReplyListener>();

export const emitReviewSocketEvent = (
  action: SocketAction,
  data: Review,
) => {
  reviewListeners.forEach((listener) => listener({ action, data }));
};

export const emitReviewReplySocketEvent = (
  action: SocketAction,
  data: ReviewReply,
) => {
  reviewReplyListeners.forEach((listener) => listener({ action, data }));
};

export const subscribeReviewSocketEvents = (listener: ReviewListener) => {
  reviewListeners.add(listener);
  return () => {
    reviewListeners.delete(listener);
  };
};

export const subscribeReviewReplySocketEvents = (
  listener: ReviewReplyListener,
) => {
  reviewReplyListeners.add(listener);
  return () => {
    reviewReplyListeners.delete(listener);
  };
};

export interface SubscribeReviewEventsOptions {
  entityId?: string;
  onReview?: ReviewSocketHandler;
  onReviewReply?: ReviewReplySocketHandler;
}

export const subscribeReviewEvents = ({
  entityId,
  onReview,
  onReviewReply,
}: SubscribeReviewEventsOptions) => {
  const unsubscribers: Array<() => void> = [];

  if (onReview) {
    unsubscribers.push(
      subscribeReviewSocketEvents(({ action, data }) => {
        if (entityId && data.targetEntityId !== entityId) return;
        onReview({ action, data });
      }),
    );
  }

  if (onReviewReply) {
    unsubscribers.push(
      subscribeReviewReplySocketEvents(({ action, data }) => {
        if (entityId && data.targetEntityId !== entityId) return;
        onReviewReply({ action, data });
      }),
    );
  }

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
};
