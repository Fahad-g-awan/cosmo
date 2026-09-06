import type {
  GetCategoryRequest,
  GetCategoryResponse,
  GetCategoriesRequest,
  GetCategoriesResponse,
  GetBrandRequest,
  GetBrandResponse,
  GetBrandsRequest,
  GetBrandsResponse,
  GetTreatmentRequest,
  GetTreatmentResponse,
  GetTreatmentsRequest,
  GetTreatmentsResponse,
  GetSubTreatmentRequest,
  GetSubTreatmentResponse,
  GetSubTreatmentsRequest,
  GetSubTreatmentsResponse,
  GetTreatmentResultRequest,
  GetTreatmentResultResponse,
  GetTreatmentResultsRequest,
  GetTreatmentResultsResponse,
} from "../../types/treatment.types";
import { handleApiError, logApiResponse } from "../../lib/utils";
import api from "../../axiosInstance";

export const getManagementTreatmentCategoryApi = async (
  params: GetCategoryRequest,
  token: string,
): Promise<GetCategoryResponse> => {
  try {
    const response = await api.get<GetCategoryResponse>(
      `/management/treatments/categories?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/treatments/categories [GET]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementTreatmentCategoriesApi = async (
  data: GetCategoriesRequest,
  token: string,
): Promise<GetCategoriesResponse> => {
  try {
    const response = await api.post<GetCategoriesResponse>(
      `/management/treatments/categories/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/treatments/categories/list [POST]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementBrandApi = async (
  params: GetBrandRequest,
  token: string,
): Promise<GetBrandResponse> => {
  try {
    const response = await api.get<GetBrandResponse>(
      `/management/treatments/brands?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/treatments/brands [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementBrandsApi = async (
  data: GetBrandsRequest,
  token: string,
): Promise<GetBrandsResponse> => {
  try {
    const response = await api.post<GetBrandsResponse>(
      `/management/treatments/brands/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/treatments/brands/list [POST]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementTreatmentApi = async (
  params: GetTreatmentRequest,
  token: string,
): Promise<GetTreatmentResponse> => {
  try {
    const response = await api.get<GetTreatmentResponse>(
      `/management/treatments?id=${params.id}&from=${params.from}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/treatments [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementTreatmentsApi = async (
  data: GetTreatmentsRequest,
  token: string,
): Promise<GetTreatmentsResponse> => {
  try {
    const response = await api.post<GetTreatmentsResponse>(
      `/management/treatments/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/treatments/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementSubTreatmentApi = async (
  params: GetSubTreatmentRequest,
  token: string,
): Promise<GetSubTreatmentResponse> => {
  try {
    const response = await api.get<GetSubTreatmentResponse>(
      `/management/treatments/sub-treatments?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/treatments/sub-treatments [GET]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementSubTreatmentsApi = async (
  data: GetSubTreatmentsRequest,
  token: string,
): Promise<GetSubTreatmentsResponse> => {
  try {
    const response = await api.post<GetSubTreatmentsResponse>(
      `/management/treatments/sub-treatments/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/treatments/sub-treatments/list [POST]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementTreatmentResultApi = async (
  params: GetTreatmentResultRequest,
  token: string,
): Promise<GetTreatmentResultResponse> => {
  try {
    const response = await api.get<GetTreatmentResultResponse>(
      `/management/treatments/results?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/treatments/results [GET]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementTreatmentResultsApi = async (
  data: GetTreatmentResultsRequest,
  token: string,
): Promise<GetTreatmentResultsResponse> => {
  try {
    const response = await api.post<GetTreatmentResultsResponse>(
      `/management/treatments/results/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/treatments/results/list [POST]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};
