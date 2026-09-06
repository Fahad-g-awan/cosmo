import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  CreateAnnouncementRequest,
  CreateAnnouncementResponse,
  DeleteAnnouncementRequest,
  DeleteAnnouncementResponse,
  GetActiveAnnouncementsRequest,
  GetActiveAnnouncementsResponse,
  UpdateAnnouncementRequest,
  UpdateAnnouncementResponse,
} from "../../types/announcement.types";

const authHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

export const getActiveAnnouncementsApi = async (
  params?: GetActiveAnnouncementsRequest,
): Promise<GetActiveAnnouncementsResponse> => {
  try {
    const surface = params?.surface ? `?surface=${encodeURIComponent(params.surface)}` : "";
    const response = await api.get<GetActiveAnnouncementsResponse>(
      `/notifications/announcements/active${surface}`,
    );
    return logApiResponse("/notifications/announcements/active [GET]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createAnnouncementApi = async (
  data: CreateAnnouncementRequest,
  accessToken: string,
): Promise<CreateAnnouncementResponse> => {
  try {
    const response = await api.post<CreateAnnouncementResponse>(
      "/notifications/announcements",
      data,
      { headers: authHeaders(accessToken) },
    );
    return logApiResponse("/notifications/announcements [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateAnnouncementApi = async (
  data: UpdateAnnouncementRequest,
  accessToken: string,
): Promise<UpdateAnnouncementResponse> => {
  try {
    const response = await api.put<UpdateAnnouncementResponse>(
      "/notifications/announcements",
      data,
      { headers: authHeaders(accessToken) },
    );
    return logApiResponse("/notifications/announcements [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteAnnouncementApi = async (
  params: DeleteAnnouncementRequest,
  accessToken: string,
): Promise<DeleteAnnouncementResponse> => {
  try {
    const response = await api.delete<DeleteAnnouncementResponse>(
      `/notifications/announcements?id=${params.id}`,
      { headers: authHeaders(accessToken) },
    );
    return logApiResponse("/notifications/announcements [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export type {
  CreateAnnouncementRequest,
  DeleteAnnouncementRequest,
  GetActiveAnnouncementsRequest,
  UpdateAnnouncementRequest,
  CreateAnnouncementResponse,
  DeleteAnnouncementResponse,
  GetActiveAnnouncementsResponse,
  UpdateAnnouncementResponse,
} from "../../types/announcement.types";
