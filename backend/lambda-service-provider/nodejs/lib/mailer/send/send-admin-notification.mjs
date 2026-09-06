import {
  OVERSIGHT_SCOPE,
  resolveOversightRecipients,
} from "../notification-emails/actor-routing.mjs";
import { dispatchEmail } from "../dispatch-email.mjs";

/**
 * Send an admin-format oversight / audit notification email.
 *
 * @param {{
 *   type: string,
 *   data?: Record<string, unknown>,
 *   config?: Record<string, unknown>,
 *   recipients?: string[],
 *   auditScope?: typeof OVERSIGHT_SCOPE[keyof typeof OVERSIGHT_SCOPE],
 * }} params
 */
export const sendAdminNotification = async ({
  type,
  data = {},
  config = {},
  recipients,
  auditScope = OVERSIGHT_SCOPE.FULL,
}) => {
  const to = recipients ?? resolveOversightRecipients(config, auditScope);

  if (!to.length) {
    console.warn(
      "[mailer] sendAdminNotification skipped — no oversight recipients configured",
      { type, auditScope },
    );
    return null;
  }

  await dispatchEmail({
    to,
    type,
    data: {
      occurredAt: new Date().toISOString(),
      ...data,
    },
    config,
    correlationId:
      typeof data.correlationId === "string" ? data.correlationId : undefined,
  });

  return { queued: true, type, recipients: to };
};
