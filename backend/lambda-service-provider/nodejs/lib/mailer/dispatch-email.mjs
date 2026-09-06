import { queueEmail } from "./queue-email.mjs";

/**
 * Fire-and-forget email dispatch — queues when EMAIL_QUEUE_URL is set, otherwise sync SES.
 * Logs failures, never throws to callers.
 *
 * @param {{
 *   to: string | string[],
 *   type: string,
 *   data?: Record<string, unknown>,
 *   config?: Record<string, unknown>,
 *   priority?: string,
 *   correlationId?: string,
 * }} params
 */
export const dispatchEmail = async (params) => {
  try {
    await queueEmail(params);
  } catch (err) {
    console.error("[mailer] dispatchEmail failed", {
      type: params.type,
      to: params.to,
      message: err?.message ?? String(err),
    });
  }
};
