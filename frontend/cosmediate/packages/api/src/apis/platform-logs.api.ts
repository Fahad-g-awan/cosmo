import type {
  GetActivityLogRequest,
  GetActivityLogResponse,
  GetActivityLogsRequest,
  GetActivityLogsResponse,
  GetAuditLogRequest,
  GetAuditLogResponse,
  GetAuditLogsRequest,
  GetAuditLogsResponse,
} from "../types/platform-logs.types";
import { handleApiError, logApiResponse } from "../lib/utils";
import api from "../axiosInstance";

export const getAuditLogsApi = async (
  data: GetAuditLogsRequest,
  accessToken: string,
): Promise<GetAuditLogsResponse> => {
  try {
    const response = await api.post<GetAuditLogsResponse>(
      "/platform/audit-logs/list",
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse("/platform/audit-logs/list [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAuditLogApi = async (
  params: GetAuditLogRequest,
  accessToken: string,
): Promise<GetAuditLogResponse> => {
  try {
    const response = await api.get<GetAuditLogResponse>(
      `/platform/audit-logs?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse(
      `/platform/audit-logs?id=${params.id} [GET]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getActivityLogsApi = async (
  data: GetActivityLogsRequest,
  accessToken: string,
): Promise<GetActivityLogsResponse> => {
  try {
    const response = await api.post<GetActivityLogsResponse>(
      "/platform/activity-logs/list",
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse("/platform/activity-logs/list [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getActivityLogApi = async (
  params: GetActivityLogRequest,
  accessToken: string,
): Promise<GetActivityLogResponse> => {
  try {
    const response = await api.get<GetActivityLogResponse>(
      `/platform/activity-logs?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return logApiResponse(
      `/platform/activity-logs?id=${params.id} [GET]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};
