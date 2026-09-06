import api from "../axiosInstance";
import { buildFlexibleMetricsQuery } from "../lib/flexible-metrics-query";
import { handleApiError, logApiResponse } from "../lib/utils";
import type {
  GetSpecialistRequest,
  GetSpecialistResponse,
  GetSpecialistsRequest,
  GetSpecialistsResponse,
  CreateSpecialistResponse,
  UpdateSpecialistResponse,
  DeleteSpecialistRequest,
  DeleteSpecialistResponse,
  GetTopSearchedSpecialistsRequest,
  GetTopSearchedSpecialistsResponse,
  GetSpecialistsByTreatmentIdRequest,
  GetSpecialistsByTreatmentIdResponse,
} from "../types/specialist.types";

export const getSpecialistApi = async (
  params: GetSpecialistRequest
): Promise<GetSpecialistResponse> => {
  try {
    const response = await api.get<GetSpecialistResponse>(
      `/specialists?id=${params.id}&from=${params.from}`
    );
    return logApiResponse(`/specialists [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSpecialistsApi = async (
  data: GetSpecialistsRequest
): Promise<GetSpecialistsResponse> => {
  try {
    const response = await api.post<GetSpecialistsResponse>(
      `/specialists/list`,
      data
    );
    return logApiResponse(`/specialists/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createSpecialistApi = async (
  data: FormData,
  token: string
): Promise<CreateSpecialistResponse> => {
  try {
    const response = await api.post<CreateSpecialistResponse>(
      "/specialists",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return logApiResponse("/specialists [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSpecialistApi = async (
  data: FormData,
  token: string
): Promise<UpdateSpecialistResponse> => {
  try {
    const response = await api.put<UpdateSpecialistResponse>(
      "/specialists",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return logApiResponse("/specialists [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteSpecialistApi = async (
  params: DeleteSpecialistRequest,
  token: string
): Promise<DeleteSpecialistResponse> => {
  try {
    const response = await api.delete<DeleteSpecialistResponse>(
      `/specialists?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return logApiResponse("/specialists [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTopSearchedSpecialistsApi = async (
  params: GetTopSearchedSpecialistsRequest = {}
): Promise<GetTopSearchedSpecialistsResponse> => {
  try {
    const queryParams = buildFlexibleMetricsQuery(params);
    const response = await api.get<GetTopSearchedSpecialistsResponse>(
      `/specialists/top-searched${queryParams}`
    );
    return logApiResponse(`/specialists/top-searched [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSpecialistsByTreatmentIdApi = async (
  data: GetSpecialistsByTreatmentIdRequest
): Promise<GetSpecialistsByTreatmentIdResponse> => {
  try {
    const response = await api.post<GetSpecialistsByTreatmentIdResponse>(
      `/specialists/by-treatment/list`,
      data
    );
    return logApiResponse(
      `/specialists/by-treatment/list [POST]`,
      response.data
    );
  } catch (error) {
    return handleApiError(error);
  }
};
