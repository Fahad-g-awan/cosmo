import { escapeHtml } from "../_layout.mjs";
import { devLayout } from "./_layout-dev.mjs";

/**
 * @param {Record<string, unknown>} data
 */
export const devDlqMessageEmail = (data) => {
  const env = String(data.env ?? "unknown");
  const kind = String(data.kind ?? "UNKNOWN");
  const source = data.sourceQueue ?? data.dlqName ?? "unknown queue";
  const subject = `[${env}] DLQ — ${kind} from ${source}`;

  const fields = {
    Environment: env,
    "Message kind": kind,
    Summary: data.summary,
    "Source queue (inferred or attribute)": data.sourceQueue,
    "DLQ name": data.dlqName,
    "SQS message ID": data.messageId,
    "Approx receive count": data.approximateReceiveCount,
    "Sent timestamp": data.sentTimestamp,
    "Email type": data.emailType,
    Recipients: Array.isArray(data.recipients)
      ? data.recipients.join(", ")
      : data.recipients,
    "Correlation ID": data.correlationId,
    "Event detail type": data.detailType,
    "Entity type": data.entityType,
    "Entity ID": data.entityId,
    "SNS topic": data.snsTopicArn,
    "Parse error": data.parseError,
    Timestamp: data.occurredAt
      ? new Date(String(data.occurredAt)).toUTCString()
      : undefined,
    Payload: data.payloadPreview,
  };

  const rows = Object.entries(fields)
    .filter(([, value]) => value != null && value !== "")
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:6px 12px 6px 0;vertical-align:top;font-weight:600;white-space:nowrap;color:#555;">${escapeHtml(label)}</td>
        <td style="padding:6px 0;word-break:break-word;"><code style="font-size:12px;">${escapeHtml(String(value))}</code></td>
      </tr>`,
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;font-family:system-ui,sans-serif;font-size:14px;">
      A message landed on the shared dead-letter queue and could not be processed by its consumer.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
      ${rows}
    </table>
  `;

  const { html, text } = devLayout({ title: "Dead letter queue alert", body });

  return { subject, html, text };
};
