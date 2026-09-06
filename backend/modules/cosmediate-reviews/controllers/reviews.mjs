import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createReview as createReviewService,
  deleteReview as deleteReviewService,
  getReviewById,
  listReviews,
  updateReview as updateReviewService,
} from "../services/review.service.mjs";

export const createReviewHandler = async () => {
  try {
    return await createReviewService(getRequestContext());
  } catch (error) {
    console.error("[reviews] create review", error);
    rethrowOrInternal(error);
  }
};

export const getReview = async () => {
  try {
    return await getReviewById(getRequestContext());
  } catch (error) {
    console.error("[reviews] get review", error);
    rethrowOrInternal(error);
  }
};

export const getReviews = async () => {
  try {
    return await listReviews(getRequestContext());
  } catch (error) {
    console.error("[reviews] list reviews", error);
    rethrowOrInternal(error);
  }
};

export const updateReviewHandler = async () => {
  try {
    return await updateReviewService(getRequestContext());
  } catch (error) {
    console.error("[reviews] update review", error);
    rethrowOrInternal(error);
  }
};

export const deleteReviewHandler = async () => {
  try {
    return await deleteReviewService(getRequestContext());
  } catch (error) {
    console.error("[reviews] delete review", error);
    rethrowOrInternal(error);
  }
};

export { createReviewHandler as createReview };
export { updateReviewHandler as updateReview };
export { deleteReviewHandler as deleteReview };
