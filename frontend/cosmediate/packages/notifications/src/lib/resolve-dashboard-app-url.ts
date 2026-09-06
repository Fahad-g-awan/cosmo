import { getClientAppUrlFromHostname } from "@cosmediate/config";

/**
 * Resolve dashboard app URLs for notification actions on marketing surfaces.
 */
export const resolveDashboardAppUrl = (path: string): string => {
  if (typeof window === "undefined") {
    return path;
  }

  const base = getClientAppUrlFromHostname(window.location.hostname, "app");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
};
