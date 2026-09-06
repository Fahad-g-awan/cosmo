import { DLQ_MESSAGE_KIND } from "./dlq-message-kinds.mjs";
import { truncatePayload } from "./truncate-payload.mjs";

/**
 * @param {string} arn
 */
export const parseQueueNameFromArn = (arn) => {
  if (!arn || typeof arn !== "string") return null;
  const parts = arn.split(":");
  return parts.length >= 6 ? parts.at(-1) : null;
};

/**
 * @param {Record<string, { stringValue?: string, StringValue?: string }>} messageAttributes
 */
const readMessageAttribute = (messageAttributes, key) => {
  const attr = messageAttributes?.[key];
  if (!attr) return null;
  return attr.stringValue ?? attr.StringValue ?? null;
};

/**
 * @param {unknown} parsed
 */
const analyzeEmailPayload = (parsed) => {
  if (!parsed || typeof parsed !== "object") return null;
  if (!parsed.emailType || !Array.isArray(parsed.recipients)) return null;

  return {
    kind: DLQ_MESSAGE_KIND.EMAIL,
    summary: `Email queue message (${parsed.emailType})`,
    inferredSourceQueue: "emails",
    emailType: String(parsed.emailType),
    recipients: parsed.recipients.map(String),
    correlationId:
      typeof parsed.correlationId === "string" ? parsed.correlationId : null,
    enqueuedAt:
      typeof parsed.enqueuedAt === "string" ? parsed.enqueuedAt : null,
    payloadPreview: truncatePayload(parsed),
  };
};

/**
 * @param {unknown} parsed
 */
const analyzeEventBridgePayload = (parsed) => {
  if (!parsed || typeof parsed !== "object") return null;

  const detailType = parsed["detail-type"] ?? parsed.detailType ?? null;
  if (!detailType) return null;

  const detail = parsed.detail ?? {};
  return {
    kind: DLQ_MESSAGE_KIND.EVENTBRIDGE,
    summary: `EventBridge event (${detailType})`,
    inferredSourceQueue: "eventbridge",
    detailType: String(detailType),
    entityType:
      typeof detail.entityType === "string" ? detail.entityType : null,
    entityId: typeof detail.entityId === "string" ? detail.entityId : null,
    env: typeof detail.ENV === "string" ? detail.ENV : null,
    payloadPreview: truncatePayload(parsed),
  };
};

/**
 * @param {unknown} parsed
 */
const analyzeSnsEnvelope = (parsed) => {
  if (!parsed || typeof parsed !== "object") return null;
  if (parsed.Type !== "Notification" || typeof parsed.Message !== "string") {
    return null;
  }

  let inner = null;
  try {
    inner = JSON.parse(parsed.Message);
  } catch {
    inner = parsed.Message;
  }

  const nested =
    analyzeEmailPayload(inner) ??
    analyzeEventBridgePayload(inner) ??
    (inner && typeof inner === "object"
      ? {
          kind: DLQ_MESSAGE_KIND.JSON,
          summary: "SNS-wrapped JSON message",
          inferredSourceQueue: "sns",
          payloadPreview: truncatePayload(inner),
        }
      : {
          kind: DLQ_MESSAGE_KIND.TEXT,
          summary: "SNS-wrapped text message",
          inferredSourceQueue: "sns",
          payloadPreview: truncatePayload(parsed.Message),
        });

  return {
    ...nested,
    snsTopicArn:
      typeof parsed.TopicArn === "string" ? parsed.TopicArn : null,
    snsMessageId:
      typeof parsed.MessageId === "string" ? parsed.MessageId : null,
  };
};

/**
 * Analyze a dead-letter queue message body (generic — any producer queue).
 *
 * @param {{
 *   body: string,
 *   messageAttributes?: Record<string, { stringValue?: string, StringValue?: string }>,
 *   dlqName?: string | null,
 * }} params
 */
export const analyzeDlqMessage = ({
  body,
  messageAttributes = {},
  dlqName = null,
}) => {
  const explicitSource =
    readMessageAttribute(messageAttributes, "sourceQueue") ??
    readMessageAttribute(messageAttributes, "SourceQueue") ??
    readMessageAttribute(messageAttributes, "queueName") ??
    readMessageAttribute(messageAttributes, "x-cosmediate-source-queue");

  let parsed = null;
  let parseError = null;

  try {
    parsed = JSON.parse(body);
  } catch (err) {
    parseError = err instanceof Error ? err.message : String(err);
  }

  const fromShape =
    (parsed && analyzeEmailPayload(parsed)) ??
    (parsed && analyzeEventBridgePayload(parsed)) ??
    (parsed && analyzeSnsEnvelope(parsed));

  if (fromShape) {
    return {
      ...fromShape,
      sourceQueue: explicitSource ?? fromShape.inferredSourceQueue ?? null,
      dlqName,
      parseError: null,
    };
  }

  if (parsed !== null) {
    return {
      kind: DLQ_MESSAGE_KIND.JSON,
      summary: "Generic JSON message",
      sourceQueue: explicitSource,
      dlqName,
      parseError: null,
      payloadPreview: truncatePayload(parsed),
    };
  }

  return {
    kind: DLQ_MESSAGE_KIND.TEXT,
    summary: "Non-JSON message body",
    sourceQueue: explicitSource,
    dlqName,
    parseError,
    payloadPreview: truncatePayload(body),
  };
};
