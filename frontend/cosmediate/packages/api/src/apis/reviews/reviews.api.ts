import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetReviewRequest,
  GetReviewResponse,
  GetReviewsRequest,
  GetReviewsResponse,
  CreateReviewRequest,
  CreateReviewResponse,
  UpdateReviewRequest,
  UpdateReviewResponse,
  DeleteReviewRequest,
  DeleteReviewResponse,
} from "../../types/review.types";

export const getReviewApi = async (
  params: GetReviewRequest
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
      `/reviews?${queryParams.toString()}`
    );
    return logApiResponse(`/reviews [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getReviewsApi = async (
  data: GetReviewsRequest
): Promise<GetReviewsResponse> => {
  try {
    const response = await api.post<GetReviewsResponse>(`/reviews/list`, data);
    return logApiResponse(`/reviews/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createReviewApi = async (
  data: CreateReviewRequest,
  accessToken: string
): Promise<CreateReviewResponse> => {
  try {
    const response = await api.post<CreateReviewResponse>("/reviews", data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/reviews [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateReviewApi = async (
  data: UpdateReviewRequest,
  accessToken: string
): Promise<UpdateReviewResponse> => {
  try {
    const response = await api.put<UpdateReviewResponse>("/reviews", data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/reviews [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteReviewApi = async (
  data: DeleteReviewRequest,
  accessToken: string
): Promise<DeleteReviewResponse> => {
  try {
    const response = await api.delete<DeleteReviewResponse>("/reviews", {
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/reviews [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
