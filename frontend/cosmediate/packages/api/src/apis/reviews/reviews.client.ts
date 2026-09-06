import type {
  GetReviewReplyRequest,
  GetReviewReplyResponse,
  GetReviewRepliesRequest,
  GetReviewRepliesResponse,
  GetReviewRequest,
  GetReviewResponse,
  GetReviewsRequest,
  GetReviewsResponse,
} from "../../types/review.types";
import {
  getManagementReviewApi,
  getManagementReviewRepliesApi,
  getManagementReviewReplyApi,
  getManagementReviewsApi,
} from "../management/reviews.management.api";
import {
  getReviewApi,
  getReviewsApi,
} from "./reviews.api";
import {
  getReviewRepliesApi,
  getReviewReplyApi,
} from "./reviewReply.api";

export type ReviewsApiScope = "public" | "management";

export const listReviews = async (
  scope: ReviewsApiScope,
  data: GetReviewsRequest,
  accessToken?: string,
): Promise<GetReviewsResponse> => {
  if (scope === "management") {
    if (!accessToken) {
      throw new Error("Management reviews list requires an access token");
    }
    return getManagementReviewsApi(data, accessToken);
  }
  return getReviewsApi(data);
};

export const getReview = async (
  scope: ReviewsApiScope,
  params: GetReviewRequest,
  accessToken?: string,
): Promise<GetReviewResponse> => {
  if (scope === "management") {
    if (!accessToken) {
      throw new Error("Management review get requires an access token");
    }
    return getManagementReviewApi(params, accessToken);
  }
  return getReviewApi(params);
};

export const listReviewReplies = async (
  scope: ReviewsApiScope,
  data: GetReviewRepliesRequest,
  accessToken?: string,
): Promise<GetReviewRepliesResponse> => {
  if (scope === "management") {
    if (!accessToken) {
      throw new Error("Management review replies list requires an access token");
    }
    return getManagementReviewRepliesApi(data, accessToken);
  }
  return getReviewRepliesApi(data);
};

export const getReviewReply = async (
  scope: ReviewsApiScope,
  params: GetReviewReplyRequest,
  accessToken?: string,
): Promise<GetReviewReplyResponse> => {
  if (scope === "management") {
    if (!accessToken) {
      throw new Error("Management review reply get requires an access token");
    }
    return getManagementReviewReplyApi(params, accessToken);
  }
  return getReviewReplyApi(params);
};
