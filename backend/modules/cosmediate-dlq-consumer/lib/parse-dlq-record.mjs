import { parseQueueNameFromArn } from "/opt/nodejs/lib/mailer/index.mjs";

/**
 * Normalize an SQS DLQ record for analysis and alerting.
 *
 * @param {import("aws-lambda").SQSRecord} record
 */
export const parseDlqRecord = (record) => {
  const dlqArn = record.eventSourceARN ?? "";
  const attributes = record.attributes ?? {};

  return {
    messageId: record.messageId,
    receiptHandle: record.receiptHandle,
    dlqArn,
    dlqName: parseQueueNameFromArn(dlqArn),
    body: record.body ?? "",
    attributes,
    messageAttributes: record.messageAttributes ?? {},
    approximateReceiveCount: attributes.ApproximateReceiveCount ?? null,
    sentTimestamp: attributes.SentTimestamp ?? null,
  };
};
