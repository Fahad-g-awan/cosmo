import type { ApiFailureResponse } from "./utils";

export const DEFAULT_MAINTENANCE_MESSAGE =
  "The platform is temporarily unavailable for maintenance.";

export interface MaintenanceBlockedState {
  message: string;
}

type MaintenanceListener = (state: MaintenanceBlockedState | null) => void;

const maintenanceListeners = new Set<MaintenanceListener>();

/** When true, maintenance 503s must not surface the blocking overlay (admin bypass). */
let maintenanceBypassActive = false;

export const setMaintenanceBypass = (active: boolean): void => {
  maintenanceBypassActive = active;
  if (active) {
    for (const listener of maintenanceListeners) {
      listener(null);
    }
  }
};

export const subscribeMaintenanceBlocked = (
  listener: MaintenanceListener,
): (() => void) => {
  maintenanceListeners.add(listener);
  return () => {
    maintenanceListeners.delete(listener);
  };
};

/** Auth/OAuth handoff routes — maintenance overlay must not block sign-in completion. */
export const MAINTENANCE_ADMIN_SETTINGS_PATH = "/settings/platform/maintenance";

export const isMaintenanceOverlaySuppressedPath = (pathname: string): boolean =>
  pathname.startsWith("/auth/processing") ||
  pathname.startsWith("/processing") ||
  pathname.startsWith(MAINTENANCE_ADMIN_SETTINGS_PATH);

export const shouldReportMaintenanceBlocked = (): boolean => {
  if (maintenanceBypassActive) return false;
  if (typeof window === "undefined") return true;
  return !isMaintenanceOverlaySuppressedPath(window.location.pathname);
};

export const reportMaintenanceBlocked = (
  state: MaintenanceBlockedState | null,
): void => {
  if (state && !shouldReportMaintenanceBlocked()) {
    return;
  }

  for (const listener of maintenanceListeners) {
    listener(state);
  }
};

export const isApiMaintenanceFailure = (
  response:
    | ApiFailureResponse
    | { success?: boolean; details?: string[] | null }
    | null
    | undefined,
): boolean =>
  Boolean(
    response?.success === false &&
      Array.isArray(response.details) &&
      response.details.includes("maintenance_mode"),
  );

type AxiosMaintenanceError = {
  response?: {
    status?: number;
    data?: { message?: string; details?: string[] };
  };
};

export const parseMaintenanceFromAxiosError = (
  error: unknown,
): MaintenanceBlockedState | null => {
  const axiosError = error as AxiosMaintenanceError;
  if (axiosError.response?.status !== 503) return null;

  const data = axiosError.response.data;
  if (!data?.details?.includes("maintenance_mode")) return null;

  return {
    message: data.message || DEFAULT_MAINTENANCE_MESSAGE,
  };
};
