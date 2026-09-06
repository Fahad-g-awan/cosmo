import { dispatchEmail } from "../dispatch-email.mjs";
import { resolveMailConfig } from "../resolve-mail-config.mjs";

/**
 * User self-notification — confirmations to the end user.
 *
 * @param {{
 *   to: string,
 *   type: string,
 *   data?: Record<string, unknown>,
 *   config?: Record<string, unknown>,
 * }} params
 */
export const sendUserNotification = async ({
  to,
  type,
  data = {},
  config = {},
}) => {
  if (!to) {
    throw new Error("[mailer] sendUserNotification requires to");
  }

  const mailConfig = resolveMailConfig(config);

  if (!mailConfig.userNotificationsEnabled) {
    console.log("[mailer] user notifications disabled — skipping", { type, to });
    return null;
  }

  await dispatchEmail({
    to,
    type,
    data,
    config,
    correlationId:
      typeof data.correlationId === "string" ? data.correlationId : undefined,
  });

  return { queued: true, type, to };
};
