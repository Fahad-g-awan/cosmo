import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createReviewReply as createReviewReplyService,
  deleteReviewReply as deleteReviewReplyService,
  getReviewReplyById,
  listReviewReplies,
  updateReviewReply as updateReviewReplyService,
} from "../services/review-reply.service.mjs";

export const createReviewReplyHandler = async () => {
  try {
    return await createReviewReplyService(getRequestContext());
  } catch (error) {
    console.error("[reviews] create reply", error);
    rethrowOrInternal(error);
  }
};

export const getReviewReply = async () => {
  try {
    return await getReviewReplyById(getRequestContext());
  } catch (error) {
    console.error("[reviews] get reply", error);
    rethrowOrInternal(error);
  }
};

export const getReviewReplies = async () => {
  try {
    return await listReviewReplies(getRequestContext());
  } catch (error) {
    console.error("[reviews] list replies", error);
    rethrowOrInternal(error);
  }
};

export const updateReviewReplyHandler = async () => {
  try {
    return await updateReviewReplyService(getRequestContext());
  } catch (error) {
    console.error("[reviews] update reply", error);
    rethrowOrInternal(error);
  }
};

export const deleteReviewReplyHandler = async () => {
  try {
    return await deleteReviewReplyService(getRequestContext());
  } catch (error) {
    console.error("[reviews] delete reply", error);
    rethrowOrInternal(error);
  }
};

export { createReviewReplyHandler as createReviewReply };
export { updateReviewReplyHandler as updateReviewReply };
export { deleteReviewReplyHandler as deleteReviewReply };
