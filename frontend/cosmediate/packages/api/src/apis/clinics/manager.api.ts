import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetClinicManagerRequest,
  GetClinicManagerResponse,
  GetClinicManagersRequest,
  GetClinicManagersResponse,
  CreateClinicManagerResponse,
  UpdateClinicManagerResponse,
  DeleteClinicManagerRequest,
  DeleteClinicManagerResponse,
} from "../../types/clinic.types";

export const getClinicManagerApi = async (
  params: GetClinicManagerRequest,
  accessToken: string
): Promise<GetClinicManagerResponse> => {
  try {
    const response = await api.get<GetClinicManagerResponse>(
      `/clinics/managers?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse(`/clinics/managers [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getClinicManagersApi = async (
  data: GetClinicManagersRequest,
  accessToken: string
): Promise<GetClinicManagersResponse> => {
  try {
    const response = await api.post<GetClinicManagersResponse>(
      `/clinics/managers/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse(`/clinics/managers/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createClinicManagerApi = async (
  formData: FormData,
  accessToken: string
): Promise<CreateClinicManagerResponse> => {
  try {
    const response = await api.post<CreateClinicManagerResponse>(
      "/clinics/managers",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/clinics/managers [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateClinicManagerApi = async (
  formData: FormData,
  accessToken: string
): Promise<UpdateClinicManagerResponse> => {
  try {
    const response = await api.put<UpdateClinicManagerResponse>(
      "/clinics/managers",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/clinics/managers [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteClinicManagerApi = async (
  params: DeleteClinicManagerRequest,
  accessToken: string
): Promise<DeleteClinicManagerResponse> => {
  try {
    const response = await api.delete<DeleteClinicManagerResponse>(
      `/clinics/managers?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/clinics/managers [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
