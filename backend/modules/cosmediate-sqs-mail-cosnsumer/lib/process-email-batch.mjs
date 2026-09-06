import { reportDevAlert, sendEmail } from "/opt/nodejs/lib/mailer/index.mjs";

import { parseEmailQueueMessage } from "./parse-queue-message.mjs";

/**
 * @param {import("aws-lambda").SQSEvent} event
 * @param {Record<string, unknown>} config
 */
export const processEmailBatch = async (event, config) => {
  const records = event.Records ?? [];
  /** @type {{ itemIdentifier: string }[]} */
  const batchItemFailures = [];

  for (const record of records) {
    /** @type {ReturnType<typeof parseEmailQueueMessage> | null} */
    let message = null;

    try {
      message = parseEmailQueueMessage(record.body);

      await sendEmail({
        to: message.recipients,
        type: message.emailType,
        data: message.data,
        config,
      });

      console.log("[mailer] processed", {
        sqsMessageId: record.messageId,
        emailType: message.emailType,
        recipients: message.recipients,
        correlationId: message.correlationId,
        enqueuedAt: message.enqueuedAt,
      });
    } catch (err) {
      console.error("[mailer] failed to process message", {
        sqsMessageId: record.messageId,
        error: err?.message ?? String(err),
      });
      batchItemFailures.push({ itemIdentifier: record.messageId });

      await reportDevAlert({
        module: "cosmediate-mailer",
        error: err,
        config,
        correlationId: message?.correlationId,
        event: {
          requestContext: {
            requestId: record.messageId,
            routeKey: message?.emailType,
          },
        },
      });
    }
  }

  return { batchItemFailures };
};
