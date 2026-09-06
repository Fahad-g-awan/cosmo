import api from "../../axiosInstance";
import { buildFlexibleMetricsQuery } from "../../lib/flexible-metrics-query";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetClinicRequest,
  GetClinicResponse,
  GetClinicsRequest,
  GetClinicsResponse,
  CreateClinicResponse,
  UpdateClinicResponse,
  DeleteClinicRequest,
  DeleteClinicResponse,
  GetPopularClinicsRequest,
  GetPopularClinicsResponse,
  GetClinicTopSearchedTreatmentsRequest,
  GetClinicTopSearchedTreatmentsResponse,
  GetClinicsByTreatmentIdRequest,
  GetClinicsByTreatmentIdResponse,
} from "../../types/clinic.types";

export const getClinicApi = async (
  params: GetClinicRequest
): Promise<GetClinicResponse> => {
  try {
    const response = await api.get<GetClinicResponse>(
      `/clinics?id=${params.id}&from=${params.from}`
    );
    return logApiResponse(`/clinics [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getClinicsApi = async (
  data: GetClinicsRequest
): Promise<GetClinicsResponse> => {
  try {
    const response = await api.post<GetClinicsResponse>(`/clinics/list`, data);
    return logApiResponse(`/clinics/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createClinicApi = async (
  formData: FormData,
  accessToken: string
): Promise<CreateClinicResponse> => {
  try {
    const response = await api.post<CreateClinicResponse>(
      "/clinics",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/clinics [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateClinicApi = async (
  formData: FormData,
  accessToken: string
): Promise<UpdateClinicResponse> => {
  try {
    const response = await api.put<UpdateClinicResponse>("/clinics", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/clinics [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteClinicApi = async (
  params: DeleteClinicRequest,
  accessToken: string
): Promise<DeleteClinicResponse> => {
  try {
    const response = await api.delete<DeleteClinicResponse>(
      `/clinics?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/clinics [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPopularClinicsApi = async (
  params: GetPopularClinicsRequest = {}
): Promise<GetPopularClinicsResponse> => {
  try {
    const queryParams = buildFlexibleMetricsQuery(params);
    const response = await api.get<GetPopularClinicsResponse>(
      `/clinics/popular${queryParams}`
    );
    return logApiResponse(`/clinics/popular [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getClinicTopSearchedTreatmentsApi = async (
  params: GetClinicTopSearchedTreatmentsRequest = {}
): Promise<GetClinicTopSearchedTreatmentsResponse> => {
  try {
    const queryParams = params.limit ? `?limit=${params.limit}` : "";
    const response = await api.get<GetClinicTopSearchedTreatmentsResponse>(
      `/clinics/top-searched${queryParams}`
    );
    return logApiResponse(`/clinics/top-searched [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getClinicsByTreatmentIdApi = async (
  data: GetClinicsByTreatmentIdRequest
): Promise<GetClinicsByTreatmentIdResponse> => {
  try {
    const response = await api.post<GetClinicsByTreatmentIdResponse>(
      `/clinics/by-treatment/list`,
      data
    );
    return logApiResponse(
      `/clinics/by-treatment/list [POST]`,
      response.data
    );
  } catch (error) {
    return handleApiError(error);
  }
};
