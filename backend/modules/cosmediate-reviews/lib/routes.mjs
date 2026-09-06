import { REVIEW_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/review.routes.mjs";
import {
  createReviewReply,
  deleteReviewReply,
  getReviewReplies,
  getReviewReply,
  updateReviewReply,
} from "../controllers/replies.mjs";
import {
  createReview,
  deleteReview,
  getReview,
  getReviews,
  updateReview,
} from "../controllers/reviews.mjs";

export const ROUTES = new Map([
  [R.GET_ONE.key, getReview],
  [R.LIST.key, getReviews],
  [R.MANAGEMENT_GET_ONE.key, getReview],
  [R.MANAGEMENT_LIST.key, getReviews],
  [R.CREATE.key, createReview],
  [R.UPDATE.key, updateReview],
  [R.DELETE.key, deleteReview],
  [R.REPLY_GET_ONE.key, getReviewReply],
  [R.REPLY_LIST.key, getReviewReplies],
  [R.MANAGEMENT_REPLY_GET_ONE.key, getReviewReply],
  [R.MANAGEMENT_REPLY_LIST.key, getReviewReplies],
  [R.REPLY_CREATE.key, createReviewReply],
  [R.REPLY_UPDATE.key, updateReviewReply],
  [R.REPLY_DELETE.key, deleteReviewReply],
]);
