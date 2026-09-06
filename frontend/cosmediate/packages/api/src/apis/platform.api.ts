import api from "../axiosInstance";

import type {
  GetPermissionsCatalogResponse,
  GetPlatformConstantsResponse,
  GetPlatformNavigationResponse,
} from "../types/permissions.types";
import type {
  GetPublicSystemSettingsResponse,
  GetSystemSettingsResponse,
  UpdateSystemSettingsRequest,
  UpdateSystemSettingsResponse,
} from "../types/system-settings.types";
import { handleApiError, logApiResponse } from "../lib/utils";

export const getPermissionsCatalogApi = async (
  token: string,
  targetRole: string,
): Promise<GetPermissionsCatalogResponse> => {
  try {
    const response = await api.get<GetPermissionsCatalogResponse>(
      `/platform/permissions/catalog?targetRole=${encodeURIComponent(targetRole)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/platform/permissions/catalog?targetRole=${targetRole} [GET]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPlatformConstantsApi = async (
  token: string,
): Promise<GetPlatformConstantsResponse> => {
  try {
    const response = await api.get<GetPlatformConstantsResponse>(
      "/platform/constants",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse("/platform/constants [GET]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPlatformNavigationApi = async (
  token: string,
): Promise<GetPlatformNavigationResponse> => {
  try {
    const response = await api.get<GetPlatformNavigationResponse>(
      "/platform/navigation",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse("/platform/navigation [GET]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSystemSettingsApi = async (
  token: string,
): Promise<GetSystemSettingsResponse> => {
  try {
    const response = await api.get<GetSystemSettingsResponse>(
      "/platform/system-settings",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse("/platform/system-settings [GET]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSystemSettingsApi = async (
  data: UpdateSystemSettingsRequest,
  token: string,
): Promise<UpdateSystemSettingsResponse> => {
  try {
    const response = await api.put<UpdateSystemSettingsResponse>(
      "/platform/system-settings",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse("/platform/system-settings [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPublicSystemSettingsApi =
  async (): Promise<GetPublicSystemSettingsResponse> => {
    try {
      const response = await api.get<GetPublicSystemSettingsResponse>(
        "/platform/system-settings/public",
      );
      return logApiResponse(
        "/platform/system-settings/public [GET]",
        response.data,
      );
    } catch (error) {
      return handleApiError(error);
    }
  };
