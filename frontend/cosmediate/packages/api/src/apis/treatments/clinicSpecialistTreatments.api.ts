import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  ListClinicSpecialistTreatmentsRequest,
  ListClinicSpecialistTreatmentsResponse,
  SyncClinicAssignmentsRequest,
  SyncClinicAssignmentsResponse,
} from "../../types/treatment.types";

export const listClinicSpecialistTreatmentsApi = async (
  data: ListClinicSpecialistTreatmentsRequest
): Promise<ListClinicSpecialistTreatmentsResponse> => {
  try {
    const response = await api.post<ListClinicSpecialistTreatmentsResponse>(
      `/treatments/clinic-specialist-treatments/list`,
      data
    );
    return logApiResponse(
      `/treatments/clinic-specialist-treatments/list [POST]`,
      response.data
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const listManagementClinicSpecialistTreatmentsApi = async (
  data: ListClinicSpecialistTreatmentsRequest,
  accessToken: string
): Promise<ListClinicSpecialistTreatmentsResponse> => {
  try {
    const response = await api.post<ListClinicSpecialistTreatmentsResponse>(
      `/management/treatments/clinic-specialist-treatments/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse(
      `/management/treatments/clinic-specialist-treatments/list [POST]`,
      response.data
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const syncClinicAssignmentsApi = async (
  data: SyncClinicAssignmentsRequest,
  accessToken: string
): Promise<SyncClinicAssignmentsResponse> => {
  try {
    const response = await api.put<SyncClinicAssignmentsResponse>(
      `/treatments/clinic-treatments/assignments/sync`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse(
      `/treatments/clinic-treatments/assignments/sync [PUT]`,
      response.data
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export type {
  ListClinicSpecialistTreatmentsRequest,
  ListClinicSpecialistTreatmentsResponse,
  SyncClinicAssignmentsRequest,
  SyncClinicAssignmentsResponse,
} from "../../types/treatment.types";
