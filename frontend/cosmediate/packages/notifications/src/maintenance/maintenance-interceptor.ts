import {
  api,
  parseMaintenanceFromAxiosError,
  reportMaintenanceBlocked,
} from "@cosmediate/api";

let installed = false;

const MAINTENANCE_ALLOWLIST_URL_FRAGMENTS = [
  "/notifications/announcements/active",
  "/platform/system-settings/public",
  "/auth/sign-in",
  "/auth/tokens/refresh",
  "/auth/me",
  "/auth/me/notifications",
];

const isMaintenanceAllowlisted = (url: string) =>
  MAINTENANCE_ALLOWLIST_URL_FRAGMENTS.some((fragment) => url.includes(fragment));

/**
 * Registers a one-time axios **503 maintenance** handler.
 */
export const ensureApiMaintenanceInterceptor = (): void => {
  if (installed || typeof window === "undefined") return;
  installed = true;

  api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const requestUrl =
        typeof (error as { config?: { url?: string } }).config?.url === "string"
          ? (error as { config: { url: string } }).config.url
          : "";

      if (!isMaintenanceAllowlisted(requestUrl)) {
        const blocked = parseMaintenanceFromAxiosError(error);
        if (blocked) {
          reportMaintenanceBlocked(blocked);
        }
      }

      throw error;
    },
  );
};
