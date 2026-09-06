import type {
  GetClinicCategoryRequest,
  GetClinicCategoryResponse,
  GetClinicCategoriesRequest,
  GetClinicCategoriesResponse,
  GetClinicRequest,
  GetClinicResponse,
  GetClinicsRequest,
  GetClinicsResponse,
  GetClinicsByTreatmentIdRequest,
  GetClinicsByTreatmentIdResponse,
} from "../../types/clinic.types";
import { handleApiError, logApiResponse } from "../../lib/utils";
import api from "../../axiosInstance";

export const getManagementClinicCategoryApi = async (
  params: GetClinicCategoryRequest,
  token: string,
): Promise<GetClinicCategoryResponse> => {
  try {
    const response = await api.get<GetClinicCategoryResponse>(
      `/management/clinics/categories?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/clinics/categories [GET]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementClinicCategoriesApi = async (
  data: GetClinicCategoriesRequest,
  token: string,
): Promise<GetClinicCategoriesResponse> => {
  try {
    const response = await api.post<GetClinicCategoriesResponse>(
      `/management/clinics/categories/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/clinics/categories/list [POST]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementClinicApi = async (
  params: GetClinicRequest,
  token: string,
): Promise<GetClinicResponse> => {
  try {
    const response = await api.get<GetClinicResponse>(
      `/management/clinics?id=${params.id}&from=${params.from}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/clinics [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementClinicsApi = async (
  data: GetClinicsRequest,
  token: string,
): Promise<GetClinicsResponse> => {
  try {
    const response = await api.post<GetClinicsResponse>(
      `/management/clinics/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/clinics/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementClinicsByTreatmentIdApi = async (
  data: GetClinicsByTreatmentIdRequest,
  token: string,
): Promise<GetClinicsByTreatmentIdResponse> => {
  try {
    const response = await api.post<GetClinicsByTreatmentIdResponse>(
      `/management/clinics/by-treatment/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/clinics/by-treatment/list [POST]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};
