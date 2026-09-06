import api from "../axiosInstance";
import { handleApiError, logApiResponse } from "../lib/utils";
import type {
  GetPatientRequest,
  GetPatientsResponse,
  GetPatientsRequest,
  GetPatientResponse,
  CreatePatientResponse,
  UpdatePatientResponse,
  DeletePatientRequest,
  DeletePatientResponse,
} from "../types/patient.types";

export const getPatientsApi = async (
  data: GetPatientsRequest,
  accessToken: string,
): Promise<GetPatientsResponse> => {
  try {
    const response = await api.post<GetPatientsResponse>(`/patients/list`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/patients/list [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPatientApi = async (
  params: GetPatientRequest,
  accessToken: string,
): Promise<GetPatientResponse> => {
  try {
    const response = await api.get<GetPatientResponse>(
      `/patients?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse(`/patients?id=${params.id} [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createPatientApi = async (
  formData: FormData,
  accessToken: string,
): Promise<CreatePatientResponse> => {
  try {
    const response = await api.post<CreatePatientResponse>("/patients", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/patients [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updatePatientApi = async (
  formData: FormData,
  accessToken: string,
): Promise<UpdatePatientResponse> => {
  try {
    const response = await api.put<UpdatePatientResponse>("/patients", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/patients [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deletePatientApi = async (
  params: DeletePatientRequest,
  accessToken: string,
): Promise<DeletePatientResponse> => {
  try {
    const response = await api.delete<DeletePatientResponse>(
      `/patients?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse("/patients [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
