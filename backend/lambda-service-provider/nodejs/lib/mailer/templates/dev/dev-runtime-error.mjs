import { escapeHtml } from "../_layout.mjs";
import { devLayout } from "./_layout-dev.mjs";

/**
 * @param {Record<string, unknown>} data
 */
export const devRuntimeErrorEmail = (data) => {
  const env = String(data.env ?? "unknown");
  const subject = `[${env}] Runtime error — ${data.module ?? "unknown module"}`;

  const fields = {
    Environment: env,
    Module: data.module,
    "Error name": data.errorName,
    "Error message": data.errorMessage,
    "Correlation ID": data.correlationId,
    Timestamp: data.occurredAt
      ? new Date(String(data.occurredAt)).toUTCString()
      : undefined,
    "Request ID": data.requestId,
    Route: data.routeKey,
    "Stack trace": data.stackTrace,
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
    <p style="margin:0 0 16px;font-family:system-ui,sans-serif;font-size:14px;">An unhandled runtime error was reported.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
      ${rows}
    </table>
  `;

  const { html, text } = devLayout({ title: "Runtime error", body });

  return { subject, html, text };
};
