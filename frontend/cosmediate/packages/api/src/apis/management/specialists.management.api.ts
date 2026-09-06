import type {
  GetSpecialistRequest,
  GetSpecialistResponse,
  GetSpecialistsRequest,
  GetSpecialistsResponse,
  GetSpecialistsByTreatmentIdRequest,
  GetSpecialistsByTreatmentIdResponse,
} from "../../types/specialist.types";
import { handleApiError, logApiResponse } from "../../lib/utils";
import api from "../../axiosInstance";

export const getManagementSpecialistApi = async (
  params: GetSpecialistRequest,
  token: string,
): Promise<GetSpecialistResponse> => {
  try {
    const response = await api.get<GetSpecialistResponse>(
      `/management/specialists?id=${params.id}&from=${params.from}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/specialists [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementSpecialistsApi = async (
  data: GetSpecialistsRequest,
  token: string,
): Promise<GetSpecialistsResponse> => {
  try {
    const response = await api.post<GetSpecialistsResponse>(
      `/management/specialists/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/specialists/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementSpecialistsByTreatmentIdApi = async (
  data: GetSpecialistsByTreatmentIdRequest,
  token: string,
): Promise<GetSpecialistsByTreatmentIdResponse> => {
  try {
    const response = await api.post<GetSpecialistsByTreatmentIdResponse>(
      `/management/specialists/by-treatment/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/specialists/by-treatment/list [POST]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};
