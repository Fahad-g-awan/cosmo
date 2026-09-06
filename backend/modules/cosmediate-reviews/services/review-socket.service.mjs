import { broadcastSocketMessage } from "/opt/nodejs/lib/realtime/socket-broadcast.mjs";

export const SOCKET_EVENTS = Object.freeze({
  REVIEW_ADDED: "REVIEW_ADDED",
  REVIEW_UPDATED: "REVIEW_UPDATED",
  REVIEW_DELETED: "REVIEW_DELETED",
  REVIEW_REPLY_ADDED: "REVIEW_REPLY_ADDED",
  REVIEW_REPLY_UPDATED: "REVIEW_REPLY_UPDATED",
  REVIEW_REPLY_DELETED: "REVIEW_REPLY_DELETED",
});

export const emitReviewSocketEvent = async ({
  socketClient,
  env,
  eventType,
  data,
}) => {
  if (!socketClient || !env) {
    console.warn("[reviews] socket emit skipped — missing client or env");
    return { sent: 0, failed: 0, staleRemoved: 0 };
  }

  return broadcastSocketMessage({
    socketClient,
    env,
    message: { eventType, data },
  });
};
