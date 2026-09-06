import type {
  GetReviewRequest,
  GetReviewResponse,
  GetReviewsRequest,
  GetReviewsResponse,
  GetReviewReplyRequest,
  GetReviewReplyResponse,
  GetReviewRepliesRequest,
  GetReviewRepliesResponse,
} from "../../types/review.types";
import { handleApiError, logApiResponse } from "../../lib/utils";
import api from "../../axiosInstance";

export const getManagementReviewApi = async (
  params: GetReviewRequest,
  token: string,
): Promise<GetReviewResponse> => {
  try {
    const queryParams = new URLSearchParams({
      id: params.id,
      ...(params?.targetEntityId && { targetEntityId: params?.targetEntityId }),
      ...(params?.targetEntityType && {
        targetEntityType: params?.targetEntityType,
      }),
    });
    const response = await api.get<GetReviewResponse>(
      `/management/reviews?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/reviews [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementReviewsApi = async (
  data: GetReviewsRequest,
  token: string,
): Promise<GetReviewsResponse> => {
  try {
    const response = await api.post<GetReviewsResponse>(
      `/management/reviews/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/reviews/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementReviewReplyApi = async (
  params: GetReviewReplyRequest,
  token: string,
): Promise<GetReviewReplyResponse> => {
  try {
    const queryParams = new URLSearchParams({
      id: params.id,
      reviewId: params.reviewId,
      ...(params?.targetEntityId && { targetEntityId: params?.targetEntityId }),
      ...(params?.targetEntityType && {
        targetEntityType: params?.targetEntityType,
      }),
    });
    const response = await api.get<GetReviewReplyResponse>(
      `/management/reviews/replies?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/reviews/replies [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementReviewRepliesApi = async (
  data: GetReviewRepliesRequest,
  token: string,
): Promise<GetReviewRepliesResponse> => {
  try {
    const response = await api.post<GetReviewRepliesResponse>(
      `/management/reviews/replies/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/reviews/replies/list [POST]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};
