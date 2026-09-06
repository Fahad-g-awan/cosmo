import { resolveMailConfig } from "./resolve-mail-config.mjs";

/**
 * @param {Record<string, unknown> | undefined} config
 */
export const buildMailUrls = (config) => {
  const { appBaseUrl, appDashboardUrl } = resolveMailConfig(config);
  return {
    appBaseUrl,
    signInUrl: `${appBaseUrl}/auth/signin`,
    dashboardUrl: appDashboardUrl,
  };
};

/**
 * @param {string[]} clinicNames
 * @returns {string}
 */
export const formatClinicNames = (clinicNames = []) => {
  const names = [
    ...new Set(
      clinicNames.map((name) => String(name ?? "").trim()).filter(Boolean),
    ),
  ];

  if (!names.length) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
};

/**
 * @param {Record<string, unknown> | undefined} config
 */
export const buildReviewUrl = (config) => {
  const { dashboardUrl } = buildMailUrls(config);
  return `${dashboardUrl}/reviews`;
};
