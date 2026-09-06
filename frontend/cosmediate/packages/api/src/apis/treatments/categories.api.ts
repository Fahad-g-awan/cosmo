import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetCategoryRequest,
  GetCategoryResponse,
  GetCategoriesRequest,
  GetCategoriesResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  DeleteCategoryRequest,
  DeleteCategoryResponse,
} from "../../types/treatment.types";

export const getTreatmentCategoryApi = async (
  params: GetCategoryRequest
): Promise<GetCategoryResponse> => {
  try {
    const response = await api.get<GetCategoryResponse>(
      `/treatments/categories?id=${params.id}`
    );
    return logApiResponse(`/treatments/categories [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTreatmentCategoriesApi = async (
  data: GetCategoriesRequest
): Promise<GetCategoriesResponse> => {
  try {
    const response = await api.post<GetCategoriesResponse>(
      `/treatments/categories/list`,
      data
    );
    return logApiResponse(`/treatments/categories [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createTreatmentCategoryApi = async (
  data: CreateCategoryRequest,
  accessToken: string
): Promise<CreateCategoryResponse> => {
  try {
    const response = await api.post<CreateCategoryResponse>(
      `/treatments/categories`,
      data,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return logApiResponse(`/treatments/categories [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateTreatmentCategoryApi = async (
  data: UpdateCategoryRequest,
  accessToken: string
): Promise<UpdateCategoryResponse> => {
  try {
    const response = await api.put<UpdateCategoryResponse>(
      `/treatments/categories`,
      data,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return logApiResponse(`/treatments/categories [PUT]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteTreatmentCategoryApi = async (
  params: DeleteCategoryRequest,
  accessToken: string
): Promise<DeleteCategoryResponse> => {
  try {
    const response = await api.delete<DeleteCategoryResponse>(
      `/treatments/categories?id=${params.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return logApiResponse(`/treatments/categories [DELETE]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
