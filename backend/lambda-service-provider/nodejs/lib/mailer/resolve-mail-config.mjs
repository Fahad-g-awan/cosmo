import {
  DEFAULT_APP_BASE_URL,
  DEFAULT_APP_DASHBOARD_URL,
  DEFAULT_FROM_EMAIL,
  DEFAULT_DEV_ALERT_MIN_INTERVAL_MS,
} from "./mailer.config.mjs";

/**
 * Mail-related config with safe fallbacks. Does not require SSM keys to exist yet.
 *
 * @param {Record<string, unknown> | undefined} config
 */
export const resolveMailConfig = (config = {}) => {
  const fromEmail =
    config.MAIL_FROM_ADDRESS ??
    process.env.MAIL_FROM_ADDRESS ??
    DEFAULT_FROM_EMAIL;

  const replyTo =
    config.MAIL_REPLY_TO ?? process.env.MAIL_REPLY_TO ?? undefined;

  const appBaseUrl = (
    config.APP_BASE_URL ??
    process.env.APP_BASE_URL ??
    DEFAULT_APP_BASE_URL
  ).replace(/\/$/, "");

  const appDashboardUrl = (
    config.APP_DASHBOARD_URL ??
    process.env.APP_DASHBOARD_URL ??
    DEFAULT_APP_DASHBOARD_URL
  ).replace(/\/$/, "");

  const emailQueueUrl =
    config.EMAIL_QUEUE_URL ?? process.env.EMAIL_QUEUE_URL ?? undefined;

  const devAlertEmails = parseEmailList(
    config.DEV_ALERT_EMAILS ?? process.env.DEV_ALERT_EMAILS,
  );

  const adminNotificationEmails = parseEmailList(
    config.ADMIN_NOTIFICATION_EMAILS ??
      process.env.ADMIN_NOTIFICATION_EMAILS,
  );

  const mandatoryNotificationEmails = parseEmailList(
    config.MANDATORY_NOTIFICATION_EMAILS ??
      process.env.MANDATORY_NOTIFICATION_EMAILS,
  );

  const devAlertMinIntervalMs = parsePositiveInt(
    config.DEV_ALERT_MIN_INTERVAL_MS ??
      process.env.DEV_ALERT_MIN_INTERVAL_MS,
    DEFAULT_DEV_ALERT_MIN_INTERVAL_MS,
  );

  return {
    fromEmail,
    replyTo,
    appBaseUrl,
    appDashboardUrl,
    emailQueueUrl,
    devAlertEmails,
    adminNotificationEmails,
    mandatoryNotificationEmails,
    devAlertMinIntervalMs,
    userNotificationsEnabled:
      config.USER_NOTIFICATIONS_ENABLED !== "false" &&
      process.env.USER_NOTIFICATIONS_ENABLED !== "false",
  };
};

/**
 * @param {unknown} value
 * @param {number} fallback
 */
const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

/**
 * @param {unknown} value
 * @returns {string[]}
 */
const parseEmailList = (value) => {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};
