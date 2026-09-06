import {
  analyzeDlqMessage,
  sendDlqAlertEmail,
} from "/opt/nodejs/lib/mailer/index.mjs";

import { parseDlqRecord } from "./parse-dlq-record.mjs";

/**
 * Process a batch of shared DLQ messages — analyze each payload and alert devs via SES.
 *
 * @param {import("aws-lambda").SQSEvent} event
 * @param {Record<string, unknown>} config
 */
export const processDlqBatch = async (event, config) => {
  const records = event.Records ?? [];
  /** @type {{ itemIdentifier: string }[]} */
  const batchItemFailures = [];

  for (const record of records) {
    const parsed = parseDlqRecord(record);

    try {
      const analysis = analyzeDlqMessage({
        body: parsed.body,
        messageAttributes: parsed.messageAttributes,
        dlqName: parsed.dlqName,
      });

      await sendDlqAlertEmail({
        analysis,
        recordMeta: {
          messageId: parsed.messageId,
          dlqName: parsed.dlqName,
          dlqArn: parsed.dlqArn,
          approximateReceiveCount: parsed.approximateReceiveCount,
          sentTimestamp: parsed.sentTimestamp,
        },
        config,
      });

      console.log("[dlq] processed", {
        sqsMessageId: parsed.messageId,
        kind: analysis.kind,
        sourceQueue: analysis.sourceQueue,
        summary: analysis.summary,
      });
    } catch (err) {
      console.error("[dlq] failed to process message", {
        sqsMessageId: parsed.messageId,
        error: err?.message ?? String(err),
      });
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
