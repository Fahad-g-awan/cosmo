import { sendEmail } from "../send-email.mjs";
import { EMAIL_TYPE } from "../mailer.config.mjs";
import { resolveMailConfig } from "../resolve-mail-config.mjs";

/**
 * Send a DLQ alert directly via SES (never queued).
 *
 * @param {{
 *   analysis: Record<string, unknown>,
 *   recordMeta?: Record<string, unknown>,
 *   config?: Record<string, unknown>,
 * }} params
 */
export const sendDlqAlertEmail = async ({
  analysis,
  recordMeta = {},
  config = {},
}) => {
  const mailConfig = resolveMailConfig(config);
  const recipients = mailConfig.devAlertEmails;

  if (!recipients.length) {
    console.warn("[mailer] sendDlqAlertEmail skipped — DEV_ALERT_EMAILS unset");
    return null;
  }

  const result = await sendEmail({
    to: recipients,
    type: EMAIL_TYPE.DEV_DLQ_MESSAGE,
    data: {
      env: config.ENV ?? process.env.ENV,
      occurredAt: new Date().toISOString(),
      ...recordMeta,
      ...analysis,
    },
    config,
  });

  console.log("[mailer] DLQ alert sent via SES", {
    kind: analysis.kind,
    sourceQueue: analysis.sourceQueue,
    messageId: recordMeta.messageId,
    sesMessageId: result?.MessageId,
  });

  return result;
};
