import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetTreatmentResultRequest,
  GetTreatmentResultResponse,
  GetTreatmentResultsRequest,
  GetTreatmentResultsResponse,
  CreateTreatmentResultResponse,
  UpdateTreatmentResultResponse,
  DeleteTreatmentResultRequest,
  DeleteTreatmentResultResponse,
} from "../../types/treatment.types";

export const getTreatmentResultApi = async (
  params: GetTreatmentResultRequest
): Promise<GetTreatmentResultResponse> => {
  try {
    const response = await api.get<GetTreatmentResultResponse>(
      `/treatments/results?id=${params.id}`
    );
    return logApiResponse(`/treatments/results [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTreatmentResultsApi = async (
  data: GetTreatmentResultsRequest
): Promise<GetTreatmentResultsResponse> => {
  try {
    const response = await api.post<GetTreatmentResultsResponse>(
      `/treatments/results/list`,
      data
    );
    return logApiResponse(`/treatments/results/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createTreatmentResultApi = async (
  data: FormData,
  accessToken: string
): Promise<CreateTreatmentResultResponse> => {
  try {
    const response = await api.post<CreateTreatmentResultResponse>(
      "/treatments/results",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/treatments/results [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateTreatmentResultApi = async (
  data: FormData,
  accessToken: string
): Promise<UpdateTreatmentResultResponse> => {
  try {
    const response = await api.put<UpdateTreatmentResultResponse>(
      "/treatments/results",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/treatments/results [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteTreatmentResultApi = async (
  params: DeleteTreatmentResultRequest,
  accessToken: string
): Promise<DeleteTreatmentResultResponse> => {
  try {
    const response = await api.delete<DeleteTreatmentResultResponse>(
      `/treatments/results?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/treatments/results [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
