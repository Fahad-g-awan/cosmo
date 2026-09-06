export interface SystemSettings {
  id: string;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  maintenanceAllowAdminAccess: boolean;
  featureFlags: Record<string, unknown>;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface PublicSystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  maintenanceAllowAdminAccess: boolean;
}
