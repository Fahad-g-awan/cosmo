import { dispatchEmail } from "../dispatch-email.mjs";
import { EMAIL_TYPE } from "../mailer.config.mjs";
import { resolveMailConfig } from "../resolve-mail-config.mjs";
import { shouldSendDevAlert } from "./dev-alert-rate-limit.mjs";

/**
 * Send a dev/runtime alert email to DEV_ALERT_EMAILS.
 *
 * @param {{ data?: Record<string, unknown>, config?: Record<string, unknown> }} params
 */
export const sendDevAlertEmail = async ({ data = {}, config = {} }) => {
  const mailConfig = resolveMailConfig(config);
  const recipients = mailConfig.devAlertEmails;

  if (!recipients.length) {
    console.warn("[mailer] sendDevAlertEmail skipped — DEV_ALERT_EMAILS unset");
    return null;
  }

  const rateLimitKey = `dev:${data.module ?? "unknown"}:${data.errorName ?? "error"}`;
  if (!shouldSendDevAlert(rateLimitKey, mailConfig.devAlertMinIntervalMs)) {
    console.log("[mailer] dev alert rate-limited — skipping", { rateLimitKey });
    return null;
  }

  await dispatchEmail({
    to: recipients,
    type: EMAIL_TYPE.DEV_RUNTIME_ERROR,
    data: {
      env: config.ENV ?? process.env.ENV,
      occurredAt: new Date().toISOString(),
      ...data,
    },
    config,
    priority: "high",
    correlationId:
      typeof data.correlationId === "string" ? data.correlationId : undefined,
  });

  return { queued: true, type: EMAIL_TYPE.DEV_RUNTIME_ERROR, recipients };
};
