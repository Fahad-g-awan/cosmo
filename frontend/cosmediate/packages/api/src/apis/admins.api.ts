import api from "../axiosInstance";
import { handleApiError, logApiResponse } from "../lib/utils";
import type {
  GetAdminRequest,
  GetAdminsResponse,
  GetAdminsRequest,
  GetAdminResponse,
  CreateAdminResponse,
  UpdateAdminResponse,
  DeleteAdminRequest,
  DeleteAdminResponse,
} from "../types/admin.types";

export const getAdminsApi = async (
  data: GetAdminsRequest,
  token: string,
): Promise<GetAdminsResponse> => {
  try {
    const response = await api.post<GetAdminsResponse>(`/admins/list`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return logApiResponse("/admins/list [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAdminApi = async (
  params: GetAdminRequest,
  token: string,
): Promise<GetAdminResponse> => {
  try {
    const response = await api.get<GetAdminResponse>(
      `/admins?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/admins [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createAdminApi = async (
  data: FormData,
  token: string,
): Promise<CreateAdminResponse> => {
  try {
    const response = await api.post<CreateAdminResponse>("/admins", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return logApiResponse("/admins [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateAdminApi = async (
  formData: FormData,
  token: string,
): Promise<UpdateAdminResponse> => {
  try {
    const response = await api.put<UpdateAdminResponse>("/admins", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return logApiResponse("/admins [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteAdminApi = async (
  params: DeleteAdminRequest,
  token: string,
): Promise<DeleteAdminResponse> => {
  try {
    const response = await api.delete<DeleteAdminResponse>(
      `/admins?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse("/admins [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
