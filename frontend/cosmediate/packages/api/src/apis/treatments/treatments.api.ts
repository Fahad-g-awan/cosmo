import api from "../../axiosInstance";
import { buildFlexibleMetricsQuery } from "../../lib/flexible-metrics-query";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetTreatmentRequest,
  GetTreatmentResponse,
  GetTreatmentsRequest,
  GetTreatmentsResponse,
  CreateTreatmentResponse,
  UpdateTreatmentResponse,
  DeleteTreatmentRequest,
  DeleteTreatmentResponse,
  GetTopSearchedTreatmentsRequest,
  GetTopSearchedTreatmentsResponse,
  ListClinicTreatmentsRequest,
  ListClinicTreatmentsResponse,
  SyncClinicTreatmentsRequest,
  SyncClinicTreatmentsResponse,
} from "../../types/treatment.types";

export const getTreatmentApi = async (
  params: GetTreatmentRequest,
): Promise<GetTreatmentResponse> => {
  try {
    const response = await api.get<GetTreatmentResponse>(
      `/treatments?id=${params.id}&from=${params.from}`,
    );
    return logApiResponse(`/treatments [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTreatmentsApi = async (
  data: GetTreatmentsRequest,
): Promise<GetTreatmentsResponse> => {
  try {
    const response = await api.post<GetTreatmentsResponse>(
      `/treatments/list`,
      data,
    );
    return logApiResponse(`/treatments/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createTreatmentApi = async (
  data: FormData,
  accessToken: string,
): Promise<CreateTreatmentResponse> => {
  try {
    const response = await api.post<CreateTreatmentResponse>(
      "/treatments",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse("/treatments [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateTreatmentApi = async (
  data: FormData,
  accessToken: string,
): Promise<UpdateTreatmentResponse> => {
  try {
    const response = await api.put<UpdateTreatmentResponse>(
      "/treatments",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse("/treatments [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteTreatmentApi = async (
  params: DeleteTreatmentRequest,
  accessToken: string,
): Promise<DeleteTreatmentResponse> => {
  try {
    const response = await api.delete<DeleteTreatmentResponse>(
      `/treatments?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse("/treatments [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTopSearchedTreatmentsApi = async (
  params: GetTopSearchedTreatmentsRequest = {},
): Promise<GetTopSearchedTreatmentsResponse> => {
  try {
    const queryParams = buildFlexibleMetricsQuery(params);
    const response = await api.get<GetTopSearchedTreatmentsResponse>(
      `/treatments/top-searched${queryParams}`,
    );
    return logApiResponse(`/treatments/top-searched [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const listClinicTreatmentsApi = async (
  data: ListClinicTreatmentsRequest,
  accessToken: string,
): Promise<ListClinicTreatmentsResponse> => {
  try {
    const response = await api.post<ListClinicTreatmentsResponse>(
      `/treatments/clinic-treatments/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse(
      `/treatments/clinic-treatments/list [POST]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const syncClinicTreatmentsApi = async (
  data: SyncClinicTreatmentsRequest,
  accessToken: string,
): Promise<SyncClinicTreatmentsResponse> => {
  try {
    const response = await api.put<SyncClinicTreatmentsResponse>(
      `/treatments/clinic-treatments/sync`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse(
      `/treatments/clinic-treatments/sync [PUT]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};
