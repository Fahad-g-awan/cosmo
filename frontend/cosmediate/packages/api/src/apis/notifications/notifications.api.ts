import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  DismissNotificationRequest,
  DismissNotificationResponse,
  GetMeNotificationsRequest,
  GetMeNotificationsResponse,
} from "../../types/announcement.types";

const authHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

export const getMeNotificationsApi = async (
  accessToken: string,
  params?: GetMeNotificationsRequest,
): Promise<GetMeNotificationsResponse> => {
  try {
    const surface = params?.surface ? `?surface=${encodeURIComponent(params.surface)}` : "";
    const response = await api.get<GetMeNotificationsResponse>(
      `/auth/me/notifications${surface}`,
      { headers: authHeaders(accessToken) },
    );
    return logApiResponse("/auth/me/notifications [GET]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const dismissNotificationApi = async (
  data: DismissNotificationRequest,
  accessToken: string,
): Promise<DismissNotificationResponse> => {
  try {
    const response = await api.post<DismissNotificationResponse>(
      "/auth/me/notifications/dismiss",
      data,
      { headers: authHeaders(accessToken) },
    );
    return logApiResponse("/auth/me/notifications/dismiss [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export type {
  DismissNotificationRequest,
  GetMeNotificationsRequest,
  DismissNotificationResponse,
  GetMeNotificationsResponse,
} from "../../types/announcement.types";
