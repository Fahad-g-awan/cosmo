import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetReviewReplyRequest,
  GetReviewReplyResponse,
  GetReviewRepliesRequest,
  GetReviewRepliesResponse,
  CreateReviewReplyRequest,
  CreateReviewReplyResponse,
  UpdateReviewReplyRequest,
  UpdateReviewReplyResponse,
  DeleteReviewReplyRequest,
  DeleteReviewReplyResponse,
} from "../../types/review.types";

export const getReviewReplyApi = async (
  params: GetReviewReplyRequest
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
      `/reviews/replies?${queryParams.toString()}`
    );
    return logApiResponse(`/reviews/replies [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getReviewRepliesApi = async (
  data: GetReviewRepliesRequest
): Promise<GetReviewRepliesResponse> => {
  try {
    const response = await api.post<GetReviewRepliesResponse>(
      `/reviews/replies/list`,
      data
    );
    return logApiResponse(`/reviews/replies/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createReviewReplyApi = async (
  data: CreateReviewReplyRequest,
  accessToken: string
): Promise<CreateReviewReplyResponse> => {
  try {
    const response = await api.post<CreateReviewReplyResponse>(
      "/reviews/replies",
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/reviews/replies [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateReviewReplyApi = async (
  data: UpdateReviewReplyRequest,
  accessToken: string
): Promise<UpdateReviewReplyResponse> => {
  try {
    const response = await api.put<UpdateReviewReplyResponse>(
      "/reviews/replies",
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/reviews/replies [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteReviewReplyApi = async (
  data: DeleteReviewReplyRequest,
  accessToken: string
): Promise<DeleteReviewReplyResponse> => {
  try {
    const response = await api.delete<DeleteReviewReplyResponse>(
      "/reviews/replies",
      {
        data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/reviews/replies [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
