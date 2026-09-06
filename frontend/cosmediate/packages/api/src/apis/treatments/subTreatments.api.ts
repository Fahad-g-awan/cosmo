import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetSubTreatmentRequest,
  GetSubTreatmentResponse,
  GetSubTreatmentsRequest,
  GetSubTreatmentsResponse,
  GetPriceFiltersDataResponse,
  SyncClinicSubTreatmentsRequest,
  SyncClinicSubTreatmentsResponse,
} from "../../types/treatment.types";

export const getSubTreatmentApi = async (
  params: GetSubTreatmentRequest
): Promise<GetSubTreatmentResponse> => {
  try {
    const response = await api.get<GetSubTreatmentResponse>(
      `/treatments/sub-treatments?id=${params.id}`
    );
    return logApiResponse(`/treatments/sub-treatments [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSubTreatmentsApi = async (
  data: GetSubTreatmentsRequest
): Promise<GetSubTreatmentsResponse> => {
  try {
    const response = await api.post<GetSubTreatmentsResponse>(
      `/treatments/sub-treatments/list`,
      data
    );
    return logApiResponse(
      `/treatments/sub-treatments/list [POST]`,
      response.data
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPriceFiltersDataApi =
  async (): Promise<GetPriceFiltersDataResponse> => {
    try {
      const response = await api.get<GetPriceFiltersDataResponse>(
        `/treatments/sub-treatments/filters-data`
      );
      return logApiResponse(
        `/treatments/sub-treatments/filters-data [GET]`,
        response.data
      );
    } catch (error) {
      return handleApiError(error);
    }
  };

export const syncClinicSubTreatmentsApi = async (
  data: SyncClinicSubTreatmentsRequest,
  accessToken: string
): Promise<SyncClinicSubTreatmentsResponse> => {
  try {
    const response = await api.put<SyncClinicSubTreatmentsResponse>(
      `/treatments/clinic-treatments/sub-treatments/sync`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse(
      `/treatments/clinic-treatments/sub-treatments/sync [PUT]`,
      response.data
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export type {
  GetSubTreatmentRequest,
  GetSubTreatmentsRequest,
  GetSubTreatmentResponse,
  GetSubTreatmentsResponse,
  GetPriceFiltersDataResponse,
  SyncClinicSubTreatmentsRequest,
  SyncClinicSubTreatmentsResponse,
} from "../../types/treatment.types";
