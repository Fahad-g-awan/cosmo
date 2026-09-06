import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetAnnouncementRequest,
  GetAnnouncementResponse,
  GetAnnouncementsRequest,
  GetAnnouncementsResponse,
} from "../../types/announcement.types";

export const getManagementAnnouncementApi = async (
  params: GetAnnouncementRequest,
  token: string,
): Promise<GetAnnouncementResponse> => {
  try {
    const response = await api.get<GetAnnouncementResponse>(
      `/management/notifications/announcements?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse("/management/notifications/announcements [GET]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementAnnouncementsApi = async (
  data: GetAnnouncementsRequest,
  token: string,
): Promise<GetAnnouncementsResponse> => {
  try {
    const response = await api.post<GetAnnouncementsResponse>(
      "/management/notifications/announcements/list",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      "/management/notifications/announcements/list [POST]",
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};
