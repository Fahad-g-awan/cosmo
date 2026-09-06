import type { PublicSystemSettings, SystemSettings } from "@cosmediate/type-utils";

export interface UpdateSystemSettingsRequest {
  maintenanceMode?: boolean;
  maintenanceMessage?: string | null;
  maintenanceAllowAdminAccess?: boolean;
  featureFlags?: Record<string, unknown>;
}

export interface GetSystemSettingsResponse {
  success: boolean;
  item: SystemSettings;
}

export interface UpdateSystemSettingsResponse {
  success: boolean;
  message: string;
  item: SystemSettings;
}

export interface GetPublicSystemSettingsResponse {
  success: boolean;
  item: PublicSystemSettings;
}
