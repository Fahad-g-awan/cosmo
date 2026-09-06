import api from "../axiosInstance";
import { handleApiError, logApiResponse } from "../lib/utils";
import type {
  GetLeadRequest,
  GetLeadResponse,
  GetLeadsRequest,
  GetLeadsResponse,
  CreateLeadRequest,
  CreateLeadResponse,
  UpdateLeadRequest,
  UpdateLeadResponse,
  DeleteLeadRequest,
  DeleteLeadResponse,
} from "../types/leads.types";
import { LeadStatus } from "@cosmediate/type-utils";

export const getLeadApi = async (
  params: GetLeadRequest,
  accessToken: string
): Promise<GetLeadResponse> => {
  try {
    const response = await api.get<GetLeadResponse>(
      `/leads?id=${params.id}&from=${params.from || ""}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse(`/leads [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getLeadsApi = async (
  data: GetLeadsRequest,
  accessToken: string
): Promise<GetLeadsResponse> => {
  try {
    const response = await api.post<GetLeadsResponse>(`/leads/list`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse(`/leads/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createLeadApi = async (
  data: CreateLeadRequest
): Promise<CreateLeadResponse> => {
  try {
    const response = await api.post<CreateLeadResponse>("/leads", data);
    return logApiResponse("/leads [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateLeadApi = async (
  data: UpdateLeadRequest,
  accessToken: string
): Promise<UpdateLeadResponse> => {
  try {
    const response = await api.put<UpdateLeadResponse>("/leads", data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/leads [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateLeadStatusApi = async (
  data: { id: string; status: LeadStatus },
  accessToken: string
): Promise<UpdateLeadResponse> => {
  try {
    const response = await api.put<UpdateLeadResponse>("/leads/status", data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/leads/status [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteLeadApi = async (
  params: DeleteLeadRequest,
  accessToken: string
): Promise<DeleteLeadResponse> => {
  try {
    const response = await api.delete<DeleteLeadResponse>(
      `/leads?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse(`/leads [DELETE]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
