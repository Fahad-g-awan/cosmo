import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetClinicCategoryRequest,
  GetClinicCategoryResponse,
  GetClinicCategoriesRequest,
  GetClinicCategoriesResponse,
  CreateClinicCategoryRequest,
  CreateClinicCategoryResponse,
  UpdateClinicCategoryRequest,
  UpdateClinicCategoryResponse,
  DeleteClinicCategoryRequest,
  DeleteClinicCategoryResponse,
} from "../../types/clinic.types";

export const getClinicCategoryApi = async (
  params: GetClinicCategoryRequest
): Promise<GetClinicCategoryResponse> => {
  try {
    const response = await api.get<GetClinicCategoryResponse>(
      `/clinics/categories?id=${params.id}`
    );
    return logApiResponse(`/clinics/categories [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getClinicCategoriesApi = async (
  data: GetClinicCategoriesRequest
): Promise<GetClinicCategoriesResponse> => {
  try {
    const response = await api.post<GetClinicCategoriesResponse>(
      `/clinics/categories/list`,
      data
    );
    return logApiResponse(`/clinics/categories/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createClinicCategoryApi = async (
  data: CreateClinicCategoryRequest,
  accessToken: string
): Promise<CreateClinicCategoryResponse> => {
  try {
    const response = await api.post<CreateClinicCategoryResponse>(
      "/clinics/categories",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/clinics/categories [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateClinicCategoryApi = async (
  data: UpdateClinicCategoryRequest,
  accessToken: string
): Promise<UpdateClinicCategoryResponse> => {
  try {
    const response = await api.put<UpdateClinicCategoryResponse>(
      "/clinics/categories",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/clinics/categories [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteClinicCategoryApi = async (
  params: DeleteClinicCategoryRequest,
  accessToken: string
): Promise<DeleteClinicCategoryResponse> => {
  try {
    const response = await api.delete<DeleteClinicCategoryResponse>(
      `/clinics/categories?id=${params.id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/clinics/categories [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
